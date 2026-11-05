import { useState } from "react";
import {
  Modal,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { apiFetch } from "../../utils/apiFetch";

const DOCUMENT_TYPES = [
  { value: "referto", label: "Referto" },
  { value: "analisi", label: "Analisi" },
  { value: "prescrizione", label: "Prescrizione" },
  { value: "vaccinazione", label: "Vaccinazione" },
  { value: "altro", label: "Altro" },
];

const MedicalDocumentModal = (props) => {
  const { show, onHide, petId, onUploaded } = props;

  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("altro");
  const [documentDate, setDocumentDate] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDocumentType("altro");
    setDocumentDate("");
    setDescription("");
    setFile(null);
    setError("");
  };

  const handleClose = () => {
    if (isLoading) return;
    resetForm();
    onHide();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!petId) {
      setError("Seleziona un animale prima di caricare un documento.");
      return;
    }

    if (!file) {
      setError("Seleziona un file da caricare.");
      return;
    }

    const formData = new FormData();

    formData.append("document", file);
    formData.append("pet", petId);
    formData.append("title", title.trim());
    formData.append("documentType", documentType);

    if (documentDate) {
      formData.append("documentDate", documentDate);
    }

    if (description.trim()) {
      formData.append("description", description.trim());
    }

    try {
      setIsLoading(true);

      await apiFetch("/medical-documents", {
        method: "POST",
        body: formData,
      });

      await onUploaded?.();
      resetForm();
      onHide();
    } catch (error) {
      setError(error.message || "Errore durante il caricamento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton={!isLoading}>
        <Modal.Title className="fw-bold">
          Carica documento veterinario
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="small">
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Titolo *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Es. Referto visita veterinaria"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipologia</Form.Label>
            <Form.Select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Data del documento</Form.Label>
            <Form.Control
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descrizione</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Aggiungi eventuali annotazioni..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>File *</Form.Label>
            <Form.Control
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
            <Form.Text className="text-muted">
              Formati supportati: PDF, JPG, PNG e WEBP. Dimensione massima: 10 MB.
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Annulla
          </Button>

          <Button
            type="submit"
            variant="success"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Caricamento...
              </>
            ) : (
              "Carica documento"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MedicalDocumentModal;
