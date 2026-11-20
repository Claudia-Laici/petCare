import { useEffect, useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { apiFetch } from "../../../utils/apiFetch.js";
import FormModal from "../../shared/formalModal/FormModal";

const emptyForm = {
  name: "",
  dateAdministered: "",
  nextDueDate: "",
  isSingleDose: false,
  veterinarian: "",
  notes: "",
};

const getDateValue = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

const VaccinationModal = ({
  show,
  onHide,
  petId,
  pets = [],
  vaccination = null,
  onSaved,
}) => {
  const [form, setForm] = useState({ ...emptyForm });
  const [selectedPetId, setSelectedPetId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(vaccination?._id);
  const needsPetSelection = !petId && !isEditing;

  useEffect(() => {
    if (!show) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError("");

    if (vaccination) {
      setForm({
        name: vaccination.name ?? "",
        dateAdministered: getDateValue(
          vaccination.dateAdministered,
        ),
        nextDueDate: getDateValue(vaccination.nextDueDate),
        isSingleDose: vaccination.isSingleDose ?? false,
        veterinarian: vaccination.veterinarian ?? "",
        notes: vaccination.notes ?? "",
      });

      setSelectedPetId(
        String(vaccination.pet?._id ?? vaccination.pet ?? ""),
      );
    } else {
      setForm({ ...emptyForm });
      setSelectedPetId(String(petId ?? ""));
    }
  }, [show, vaccination, petId]);

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClose = () => {
    if (saving) return;

    setForm({ ...emptyForm });
    setSelectedPetId("");
    setError("");
    onHide();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const targetPetId = petId || selectedPetId;

    if (!isEditing && !targetPetId) {
      setError("Seleziona un animale.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const body = {
        ...form,
        nextDueDate: form.isSingleDose
          ? null
          : form.nextDueDate || null,
      };

      if (isEditing) {
        await apiFetch(`/vaccinations/${vaccination._id}`, {
          method: "PATCH",
          body,
        });
      } else {
        await apiFetch("/vaccinations", {
          method: "POST",
          body: {
            ...body,
            pet: targetPetId,
          },
        });
      }

      await onSaved?.();

      setForm({ ...emptyForm });
      setSelectedPetId("");
      setError("");
      onHide();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal
      show={show}
      onHide={handleClose}
      title={isEditing ? "Modifica vaccinazione" : "Aggiungi vaccinazione"}
      size="md"
      className="vaccination-modal"
      closeButton={!saving}
      backdrop={saving ? "static" : true}
      keyboard={!saving}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={handleClose}
            disabled={saving}
          >
            Annulla
          </Button>

          <Button type="submit" variant="success" disabled={saving}>
            {saving
              ? "Salvataggio..."
              : isEditing
                ? "Salva modifiche"
                : "Salva"}
          </Button>
        </>
      }
    >
      {error && <Alert variant="danger">{error}</Alert>}

      {needsPetSelection && (
        <Form.Group className="mb-3">
          <Form.Label>Animale</Form.Label>
          <Form.Select
            value={selectedPetId}
            onChange={(event) => setSelectedPetId(event.target.value)}
            required
          >
            <option value="">Seleziona un animale</option>

            {pets
              .filter((pet) =>
                ["owner", "editor"].includes(pet.role),
              )
              .map((pet) => (
                <option key={pet._id} value={pet._id}>
                  {pet.name}
                </option>
              ))}
          </Form.Select>
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Nome</Form.Label>
        <Form.Control
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Data somministrazione</Form.Label>
        <Form.Control
          type="date"
          name="dateAdministered"
          value={form.dateAdministered}
          onChange={handleChange}
          required
        />
        <Form.Text className="text-muted">
          Se è nel futuro, risulterà "Da effettuare".
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Prossima scadenza (richiamo)</Form.Label>
        <Form.Control
          type="date"
          name="nextDueDate"
          value={form.nextDueDate}
          onChange={handleChange}
          disabled={form.isSingleDose}
        />
        <Form.Text className="text-muted">
          Lascia vuoto se non la conosci ancora.
        </Form.Text>
      </Form.Group>

      <Form.Check
        type="checkbox"
        id="isSingleDose"
        name="isSingleDose"
        label="Unica somministrazione (nessun richiamo previsto)"
        checked={form.isSingleDose}
        onChange={handleChange}
        className="mb-3"
      />

      <Form.Group className="mb-3">
        <Form.Label>Veterinario</Form.Label>
        <Form.Control
          name="veterinarian"
          value={form.veterinarian}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Note</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="notes"
          value={form.notes}
          onChange={handleChange}
        />
      </Form.Group>
    </FormModal>
  );
};

export default VaccinationModal;
