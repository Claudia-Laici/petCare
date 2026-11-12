import { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { apiFetch } from "../../../utils/apiFetch.js";

const emptyForm = {
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

const TherapyModal = ({ show, onHide, petId, onSaved }) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      await apiFetch("/therapies", {
        method: "POST",
        body: {
          ...form,
          pet: petId,
          dosage: form.dosage ? `${form.dosage} ${form.dosageUnit}` : null,
          frequency: `${form.frequency} ${
            Number(form.frequency) === 1 ? "volta" : "volte"
          } ${
            form.frequencyUnit === "giorno"
              ? "al giorno"
              : form.frequencyUnit === "settimana"
                ? "alla settimana"
                : "al mese"
          }`,
          endDate: form.endDate || null,
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
          <Modal.Title className="fs-5">Aggiungi terapia</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

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

          <Form.Check
            type="checkbox"
            id="isOngoing"
            name="isOngoing"
            label="Terapia in corso"
            checked={form.isOngoing}
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

export default TherapyModal;
