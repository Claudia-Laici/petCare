import { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { apiFetch } from "../../../utils/apiFetch.js";

const emptyForm = {
  name: "",
  dateAdministered: "",
  nextDueDate: "",
  isSingleDose: false,
  veterinarian: "",
  notes: "",
};

const VaccinationModal = ({ show, onHide, petId, onSaved }) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleClose = () => {
    setForm(emptyForm);
    setError("");
    onHide();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await apiFetch("/vaccinations", {
        method: "POST",
        body: {
          ...form,
          pet: petId,
          nextDueDate: form.nextDueDate || null,
        },
      });

      onSaved?.();
      handleClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Aggiungi vaccinazione</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

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
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Annulla
          </Button>
          <Button type="submit" variant="success" disabled={saving}>
            {saving ? "Salvataggio..." : "Salva"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default VaccinationModal;
