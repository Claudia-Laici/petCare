import { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { apiFetch } from "../../utils/apiFetch";
import FormModal from "../shared/formalModal/FormModal";

const DOCUMENT_TYPES = [
  { value: "referto", label: "Referto" },
  { value: "analisi", label: "Analisi" },
  { value: "prescrizione", label: "Prescrizione" },
  { value: "vaccinazione", label: "Vaccinazione" },
  { value: "altro", label: "Altro" },
];

const MedicalDocumentModalForm = (props) => {
  const { show, onHide, petId, pets = [], document, onUploaded } = props;

  const isEditing = Boolean(document);

  const getInitialPetId = () => petId || (pets.length === 1 ? pets[0]._id : "");

  const [title, setTitle] = useState(() => document?.title || "");

  const [documentType, setDocumentType] = useState(
    () => document?.documentType || "altro",
  );

  const [documentDate, setDocumentDate] = useState(() =>
    document?.documentDate ? String(document.documentDate).slice(0, 10) : "",
  );

  const [description, setDescription] = useState(
    () => document?.description || "",
  );

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [selectedPetId, setSelectedPetId] = useState(
    () => document?.pet?._id || document?.pet || getInitialPetId(),
  );
  const resetForm = () => {
    setTitle("");
    setDocumentType("altro");
    setDocumentDate("");
    setDescription("");
    setFile(null);
    setError("");
    setSelectedPetId(getInitialPetId());
  };

  const handleClose = () => {
    if (isLoading) return;
    resetForm();
    onHide();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isEditing && !selectedPetId) {
      setError("Seleziona un animale prima di caricare un documento.");
      return;
    }

    if (!isEditing && !file) {
      setError("Seleziona un file da caricare.");
      return;
    }

    const formData = new FormData();

    if (file) {
      formData.append("document", file);
    }

    if (!isEditing) {
      formData.append("pet", selectedPetId);
    }

    formData.append("title", title.trim());
    formData.append("documentType", documentType);
    formData.append("documentDate", documentDate);
    formData.append("description", description.trim());

    try {
      setIsLoading(true);

      await apiFetch(
        isEditing ? `/medical-documents/${document._id}` : "/medical-documents",
        {
          method: isEditing ? "PATCH" : "POST",
          body: formData,
        },
      );

      await onUploaded?.();
      resetForm();
      onHide();
    } catch (error) {
      setError(
        error.message ||
          `Errore durante ${isEditing ? "la modifica" : "il caricamento"}.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormModal
      show={show}
      onHide={handleClose}
      title={
        isEditing
          ? "Modifica documento veterinario"
          : "Carica documento veterinario"
      }
      className="medical-document-modal"
      closeButton={!isLoading}
      backdrop={isLoading ? "static" : true}
      keyboard={!isLoading}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Annulla
          </Button>

          <Button type="submit" variant="success" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                {isEditing ? "Salvataggio..." : "Caricamento..."}
              </>
            ) : isEditing ? (
              "Salva modifiche"
            ) : (
              "Carica documento"
            )}
          </Button>
        </>
      }
    >
      {error && (
        <Alert variant="danger" className="small">
          {error}
        </Alert>
      )}

      {!isEditing && !petId && (
        <Form.Group className="mb-3">
          <Form.Label>Animale *</Form.Label>
          <Form.Select
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
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
        <Form.Label>
          {isEditing ? "Sostituisci file (facoltativo)" : "File *"}
        </Form.Label>

        {isEditing && (
          <Form.Text className="d-block mb-2 text-muted">
            File attuale: {document.format?.toUpperCase() || "Documento"}
            {" · "}
            Se non selezioni un nuovo file, quello attuale verrà mantenuto.
          </Form.Text>
        )}

        <Form.Control
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required={!isEditing}
        />

        <Form.Text className="text-muted">
          Formati supportati: PDF, JPG, PNG e WEBP. Dimensione massima: 10 MB.
        </Form.Text>
      </Form.Group>
    </FormModal>
  );
};

const MedicalDocumentModal = (props) => {
  return (
    <MedicalDocumentModalForm
      key={`${props.show}-${props.document?._id || "new"}`}
      {...props}
    />
  );
};

export default MedicalDocumentModal;
