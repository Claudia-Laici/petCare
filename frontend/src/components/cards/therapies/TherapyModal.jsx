import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { createTherapy, updateTherapy, } from "../../../services/therapies/therapyService.js";
import FormModal from "../../shared/formalModal/FormModal";

const emptyForm = {
  pet: "",
  name: "",
  dosage: "",
  dosageUnit: "compressa",
  frequency: "",
  frequencyUnit: "giorno",
  startDate: "",
  endDate: "",
  veterinarian: "",
  notes: "",
};

const getPetId = (pet) =>
  typeof pet === "object" && pet !== null ? pet._id : pet || "";

const parseFrequency = (frequency = "") => {
  const match = frequency.match(
    /^(\d+)\s+volte?\s+(al giorno|alla settimana|al mese)$/i,
  );

  if (!match) {
    return { frequency: "", frequencyUnit: "giorno" };
  }

  const units = {
    "al giorno": "giorno",
    "alla settimana": "settimana",
    "al mese": "mese",
  };

  return {
    frequency: match[1],
    frequencyUnit: units[match[2].toLowerCase()],
  };
};

const parseDosage = (dosage = "") => {
  const match = dosage.match(/^([\d.,]+)\s*(.*)$/);

  if (!match) {
    return { dosage: "", dosageUnit: "compressa" };
  }

  const units = ["compressa", "ml", "gocce", "mg", "g", "spruzzo"];

  return {
    dosage: match[1].replace(",", "."),
    dosageUnit: units.includes(match[2].toLowerCase())
      ? match[2].toLowerCase()
      : "compressa",
  };
};

const getInitialForm = (therapy, petId) => {
  if (!therapy) {
    return {
      ...emptyForm,
      pet: getPetId(petId),
    };
  }

  return {
    pet: getPetId(therapy.pet),
    name: therapy.name || "",
    ...parseDosage(therapy.dosage || ""),
    ...parseFrequency(therapy.frequency || ""),
    startDate: therapy.startDate
      ? String(therapy.startDate).slice(0, 10)
      : "",
    endDate: therapy.endDate
      ? String(therapy.endDate).slice(0, 10)
      : "",
    veterinarian: therapy.veterinarian || "",
    notes: therapy.notes || "",
  };
};

const TherapyModal = ({
  show,
  onHide,
  petId,
  pets = [],
  therapy = null,
  onSaved,
}) => {
  const [form, setForm] = useState(() => getInitialForm(therapy, petId));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(therapy);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    if (saving) return;
    setError("");
    onHide();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    const frequencyLabels = {
      giorno: "al giorno",
      settimana: "alla settimana",
      mese: "al mese",
    };

    const payload = {
      name: form.name.trim(),
      dosage: form.dosage ? `${form.dosage} ${form.dosageUnit}` : null,
      frequency: `${form.frequency} ${
        Number(form.frequency) === 1 ? "volta" : "volte"
      } ${frequencyLabels[form.frequencyUnit]}`,
      startDate: form.startDate,
      endDate: form.endDate || null,
      veterinarian: form.veterinarian.trim(),
      notes: form.notes.trim(),
    };

    try {
      if (isEditing) {
        await updateTherapy(therapy._id, payload);
      } else {
        await createTherapy({
          ...payload,
          pet: form.pet,
        });
      }

      onSaved?.();
      handleClose();
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
      title={isEditing ? "Modifica terapia" : "Aggiungi terapia"}
      size="lg"
      className="therapy-modal"
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

          <Button
            type="submit"
            variant="success"
            disabled={saving || (!isEditing && !form.pet)}
          >
            {saving ? "Salvataggio..." : "Salva"}
          </Button>
        </>
      }
    >
      {error && <Alert variant="danger">{error}</Alert>}

      {!petId && !isEditing && (
        <Form.Group className="mb-3">
          <Form.Label>Animale</Form.Label>

          <Form.Select
            name="pet"
            value={form.pet}
            onChange={handleChange}
            required
          >
            <option value="">Seleziona un animale</option>

            {pets.map((pet) => (
              <option key={pet._id} value={pet._id}>
                {pet.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Nome terapia</Form.Label>
        <Form.Control
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Dosaggio</Form.Label>

        <div className="d-flex gap-2">
          <Form.Control
            type="number"
            name="dosage"
            value={form.dosage}
            onChange={handleChange}
            placeholder="Es. 1"
            min="0"
            step="any"
          />

          <Form.Select
            name="dosageUnit"
            value={form.dosageUnit}
            onChange={handleChange}
          >
            <option value="compressa">Compressa</option>
            <option value="ml">ml</option>
            <option value="gocce">Gocce</option>
            <option value="mg">mg</option>
            <option value="g">g</option>
            <option value="spruzzo">Spruzzo</option>
          </Form.Select>
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Frequenza</Form.Label>

        <div className="d-flex gap-2">
          <Form.Control
            type="number"
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
            placeholder="Es. 1"
            min="1"
            step="1"
            required
          />

          <Form.Select
            name="frequencyUnit"
            value={form.frequencyUnit}
            onChange={handleChange}
          >
            <option value="giorno">Al giorno</option>
            <option value="settimana">Alla settimana</option>
            <option value="mese">Al mese</option>
          </Form.Select>
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Data di inizio</Form.Label>
        <Form.Control
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Data di fine</Form.Label>
        <Form.Control
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          min={form.startDate || undefined}
        />

        <Form.Text className="text-muted">
          Lascia vuoto se la terapia è ancora in corso.
        </Form.Text>
      </Form.Group>

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

export default TherapyModal;
