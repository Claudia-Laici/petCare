import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import FormModal from "../../shared/formalModal/FormModal";

const EditShareRoleModal = ({ show, onHide, share, onSave }) => {
  const [role, setRole] = useState(share?.role || "viewer");
  const [expiresAt, setExpiresAt] = useState(
    share?.expiresAt ? share.expiresAt.slice(0, 10) : "",
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);

    try {
      const saved = await onSave(share, role, expiresAt);
      if (saved) onHide();
    } finally {
      setSaving(false);
    }
  };

  if (!share) return null;

  const hasChanges =
    role !== share.role ||
    expiresAt !== (share.expiresAt ? share.expiresAt.slice(0, 10) : "");

  return (
    <FormModal
      show={show}
      onHide={onHide}
      title="Modifica permessi"
      subtitle={`Gestisci l'accesso di ${share.user?.nome || ""} ${share.user?.cognome || ""} al profilo di ${share.pet?.name || ""}.`}
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
            onClick={onHide}
            disabled={saving}
          >
            Annulla
          </Button>

          <Button
            type="submit"
            variant="success"
            disabled={saving || !hasChanges}
          >
            {saving ? "Salvataggio..." : "Salva modifiche"}
          </Button>
        </>
      }
    >
      <Form.Group className="mb-3">
        <Form.Label>Livello di accesso</Form.Label>

        <Form.Select
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          <option value="viewer">Lettura – sola visualizzazione</option>
          <option value="editor">Editor – visualizzazione e modifica</option>
        </Form.Select>

        <Form.Text className="text-muted">
          Il proprietario mantiene il controllo completo del profilo,
          delle condivisioni e delle autorizzazioni.
        </Form.Text>
      </Form.Group>

      <Form.Group>
        <Form.Label>Accesso fino al</Form.Label>

        <Form.Control
          type="date"
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
          min={new Date().toLocaleDateString("en-CA")}
        />

        <Form.Text className="text-muted">
          Lascia vuoto per un accesso senza scadenza.
        </Form.Text>
      </Form.Group>
    </FormModal>
  );
};

export default EditShareRoleModal;
