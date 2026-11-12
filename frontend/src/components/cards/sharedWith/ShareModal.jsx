import { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { apiFetch } from "../../../utils/apiFetch";

const emptyForm = { email: "", role: "viewer", expiresAt: "" };

const ShareModal = ({ show, onHide, petId, onSaved }) => {
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
      await apiFetch(`/pets/${petId}/shares`, {
        method: "POST",
        body: {
          email: form.email.trim().toLowerCase(),
          role: form.role,
          expiresAt: form.expiresAt
            ? new Date(`${form.expiresAt}T23:59:59`).toISOString()
            : null,
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
          <Modal.Title className="fs-5">Invita persona</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Permessi</Form.Label>
            <Form.Select name="role" value={form.role} onChange={handleChange}>
              <option value="viewer">Lettura</option>
              <option value="editor">Modifica</option>
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Accesso fino al</Form.Label>
            <Form.Control
              type="date"
              name="expiresAt"
              value={form.expiresAt}
              onChange={handleChange}
              min={new Date().toLocaleDateString("en-CA")}
            />
            <Form.Text className="text-muted">
              Lascia vuoto per un accesso senza scadenza.
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Annulla
          </Button>
          <Button type="submit" variant="success" disabled={saving}>
            {saving ? "Invio..." : "Invita"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ShareModal;
