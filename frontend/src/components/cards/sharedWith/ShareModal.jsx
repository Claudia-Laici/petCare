import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { apiFetch } from "../../../utils/apiFetch";
import FormModal from "../../shared/formalModal/FormModal";

const emptyForm = {
  petId: "",
  email: "",
  role: "viewer",
  expiresAt: "",
};

const ShareModal = ({
  show,
  onHide,
  petId,
  pets = [],
  initialPet = null,
  onSaved,
}) => {
  const [form, setForm] = useState({
    ...emptyForm,
    petId: petId || initialPet?._id || (pets.length === 1 ? pets[0]._id : ""),
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetAndClose = () => {
    setForm({
      ...emptyForm,
      petId: petId || initialPet?._id || (pets.length === 1 ? pets[0]._id : ""),
    });
    setError("");
    setMessage("");
    onHide();
  };

  const handleClose = () => {
    if (saving) return;
    resetAndClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.petId || !form.email.trim()) {
      setError("Seleziona un animale e inserisci un indirizzo email.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const result = await apiFetch(`/pets/${form.petId}/shares`, {
        method: "POST",
        body: {
          email: form.email.trim().toLowerCase(),
          role: form.role,
          expiresAt: form.expiresAt
            ? new Date(`${form.expiresAt}T23:59:59`).toISOString()
            : null,
        },
      });

      if (result?.shared) {
        onSaved?.({
          type: "success",
          message: "Accesso concesso correttamente.",
        });

        resetAndClose();
      } else if (result?.emailSent) {
        onSaved?.({
          type: "success",
          message:
            "Invito inviato. La persona dovrà registrarsi per accedere al profilo.",
        });

        resetAndClose();
      } else {
        setMessage(
          "La richiesta è stata ricevuta, ma non è stato possibile inviare l'email.",
        );
      }
    } catch (e) {
      setError(e.message || "Impossibile inviare l'invito.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal
      show={show}
      onHide={handleClose}
      title="Invita una persona"
      size="md"
      className="share-modal"
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
            {saving ? "Invio..." : "Invita"}
          </Button>
        </>
      }
    >
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="info">{message}</Alert>}

      {!petId && (
        <Form.Group className="mb-3">
          <Form.Label>Livello di accesso</Form.Label>

          <Form.Select name="role" value={form.role} onChange={handleChange}>
            <option value="viewer">Lettura – sola visualizzazione</option>
            <option value="editor">Editor – visualizzazione e modifica</option>
          </Form.Select>

          <Form.Text className="text-muted">
            Il proprietario mantiene sempre il controllo completo del profilo,
            delle condivisioni e delle autorizzazioni.
          </Form.Text>
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="nome@email.com"
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
    </FormModal>
  );
};

export default ShareModal;
