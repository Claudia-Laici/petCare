import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { createAppointmentShare } from "../../../services/appointments/appointmentService";
import { SHARE_FIELDS } from "../../../constants/appointments";
import FormModal from "../../shared/formalModal/FormModal";

const EXPIRATION_OPTIONS = [
  { value: "1", label: "1 giorno" },
  { value: "3", label: "3 giorni" },
  { value: "7", label: "7 giorni" },
  { value: "14", label: "14 giorni" },
  { value: "30", label: "30 giorni" },
];

const initialPermissions = Object.fromEntries(
  SHARE_FIELDS.map(({ key, defaultChecked }) => [key, defaultChecked]),
);

const AppointmentShareModal = ({ show, onHide, appointment }) => {
  const [permissions, setPermissions] = useState(initialPermissions);
  const [expiresInDays, setExpiresInDays] = useState("7");
  const [shareUrl, setShareUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handlePermissionChange = (key) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = (checked) => {
    setPermissions(
      Object.fromEntries(SHARE_FIELDS.map(({ key }) => [key, checked])),
    );
  };

  const handleGenerateLink = async () => {
    if (!appointment?._id) return;

    setIsGenerating(true);
    setError("");

    try {
      const response = await createAppointmentShare(appointment._id, {
        expiresInDays: Number(expiresInDays),
        share: permissions,
      });

      setShareUrl(`${window.location.origin}/a/${response.share.token}`);
    } catch (err) {
      setError(err.message || "Impossibile generare il link di condivisione.");
    } finally {
      setIsGenerating(false);
    }
  };

  const allSelected = Object.values(permissions).every(Boolean);

  return (
    <FormModal
      show={show}
      onHide={onHide}
      title="Condividi appuntamento"
      subtitle="Scegli quali informazioni rendere accessibili."
      size="lg"
      className="appointment-share-modal"
      closeButton={!isGenerating}
      backdrop={isGenerating ? "static" : true}
      keyboard={!isGenerating}
      footer={
        <>
          <Button
            type="button"
            variant="outline-secondary"
            className="rounded-pill"
            onClick={onHide}
            disabled={isGenerating}
          >
            Chiudi
          </Button>

          <Button
            type="button"
            variant="success"
            className="rounded-pill px-4"
            onClick={handleGenerateLink}
            disabled={isGenerating || !appointment}
          >
            {isGenerating ? (
              "Generazione..."
            ) : (
              <>
                <i className="bi bi-link-45deg me-2" />
                Genera link
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="appointment-share-section">
        <h6 className="appointment-share-title">Durata del link</h6>

        <Form.Group controlId="shareExpiration">
          <Form.Label>Il link sarà valido per</Form.Label>

          <Form.Select
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(e.target.value)}
            disabled={isGenerating}
          >
            {EXPIRATION_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>

      <div className="appointment-share-section">
        <h6 className="appointment-share-title">
          Informazioni da condividere
        </h6>

        <Form.Check
          id="share-all"
          type="checkbox"
          label="Seleziona tutte"
          className="fw-semibold mb-2"
          checked={allSelected}
          disabled={isGenerating}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />

        <div className="d-flex flex-column gap-2">
          {SHARE_FIELDS.map(({ key, label }) => (
            <Form.Check
              key={key}
              id={`share-${key}`}
              type="checkbox"
              label={label}
              checked={permissions[key]}
              disabled={isGenerating}
              onChange={() => handlePermissionChange(key)}
            />
          ))}
        </div>
      </div>

      <div className="appointment-share-link">
        <div className="d-flex flex-column gap-2">
          {error && <Form.Text className="text-danger">{error}</Form.Text>}

          <Form.Label htmlFor="shareUrl" className="mb-0">
            Link di condivisione
          </Form.Label>

          <div className="input-group">
            <Form.Control
              id="shareUrl"
              type="text"
              placeholder="Il link apparirà qui dopo la creazione"
              value={shareUrl}
              readOnly
            />

            <Button
              type="button"
              variant="outline-secondary"
              disabled={!shareUrl}
              onClick={() => navigator.clipboard.writeText(shareUrl)}
            >
              <i className="bi bi-copy me-2" />
              Copia
            </Button>
          </div>

          <Form.Text>
            Il link consentirà di visualizzare soltanto le informazioni
            selezionate.
          </Form.Text>
        </div>
      </div>
    </FormModal>
  );
};

export default AppointmentShareModal;
