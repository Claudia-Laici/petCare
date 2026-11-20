import { useEffect, useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import {
  Calendar3,
  Eye,
  FileEarmarkMedical,
  FilePdf,
  Trash3,
} from "react-bootstrap-icons";
import { apiFetch } from "../../../utils/apiFetch";
import { isImageDocument, isPdfDocument } from "../../../utils/documentFormats";
import { DOCUMENT_TYPE_LABELS } from "../../../utils/documentTypes";
import ConfirmDeleteModal from "../../shared/confirmDeleteModal/ConfirmDeleteModal";
import DocumentPreviewModal from "../documentPreviewModal/DocumentPreviewModal";
import "./DocumentCard.css";

const formatDate = (date) => {
  if (!date) return "Data non disponibile";

  return new Date(date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const fetchAccessUrl = async (id) => {
  const result = await apiFetch(`/medical-documents/${id}/access-url`);

  if (!result?.url) throw new Error("Impossibile recuperare il documento.");

  return result.url;
};

const DocumentCard = ({ document: doc, isOwner = false, onDeleted }) => {
  const isImage = isImageDocument(doc);
  const isPdf = isPdfDocument(doc);
  const typeKey = doc.documentType;

  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(isImage);
  const [isOpeningPreview, setIsOpeningPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!isImage) return;

    let isMounted = true;

    fetchAccessUrl(doc._id)
      .then((url) => {
        if (isMounted) setPreviewUrl(url);
      })
      .catch((error) => {
        if (isMounted) {
          setPreviewError(error.message || "Anteprima non disponibile.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingPreview(false);
      });

    return () => {
      isMounted = false;
    };
  }, [doc._id, isImage]);

  const handleOpenPreview = async () => {
    if (isOpeningPreview) return;

    setPreviewError("");
    setIsOpeningPreview(true);

    try {
      setPreviewUrl(await fetchAccessUrl(doc._id));
      setShowPreview(true);
    } catch (error) {
      setPreviewError(error.message || "Impossibile aprire il documento.");
    } finally {
      setIsOpeningPreview(false);
    }
  };

  const deleteDocument = async () => {
    await apiFetch(`/medical-documents/${doc._id}`, { method: "DELETE" });
    onDeleted?.();
  };

  return (
    <>
      <article className="document-card">
        <div className="document-card-preview">
          {isImage && previewUrl ? (
            <img
              src={previewUrl}
              alt={doc.title}
              className="document-card-image"
            />
          ) : (
            <div className="document-card-placeholder">
              {isPdf ? <FilePdf size={48} /> : <FileEarmarkMedical size={48} />}
              <span>{isPdf ? "Documento PDF" : "Documento"}</span>
            </div>
          )}

          {isImage && isLoadingPreview && (
            <div className="document-card-loading">
              <Spinner animation="border" size="sm" />
            </div>
          )}
        </div>

        <div className="document-card-body">
          <div className="document-card-heading">
            <span className={`document-card-type document-type-${typeKey}`}>
              {DOCUMENT_TYPE_LABELS[typeKey] || "Documento"}
            </span>

            {doc.format && (
              <span className="document-card-format">
                {doc.format.toUpperCase()}
              </span>
            )}
          </div>

          <h3 className="document-card-title">{doc.title}</h3>

          {doc.description && (
            <p className="document-card-description">{doc.description}</p>
          )}

          <div className="document-card-meta">
            <span>
              <Calendar3 size={14} />
              {formatDate(doc.documentDate)}
            </span>

            {doc.pet?.name && (
              <span className="document-card-pet">{doc.pet.name}</span>
            )}
          </div>

          {previewError && (
            <Alert variant="danger" className="document-card-alert">
              {previewError}
            </Alert>
          )}

          <div className="document-card-actions">
            <Button
              variant="outline-success"
              className="rounded-pill"
              onClick={handleOpenPreview}
              disabled={isOpeningPreview}
            >
              {isOpeningPreview ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                  <Eye size={15} className="me-2" />
                  Apri documento
                </>
              )}
            </Button>

            {isOwner && (
              <Button
                variant="outline-danger"
                className="document-card-delete"
                onClick={() => setShowDeleteModal(true)}
                aria-label="Elimina documento"
              >
                <Trash3 size={16} />
              </Button>
            )}
          </div>
        </div>
      </article>

      <DocumentPreviewModal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        document={doc}
        url={previewUrl}
      />

      {isOwner && (
        <ConfirmDeleteModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          title="Elimina documento"
          itemName={doc.title}
          onConfirm={deleteDocument}
        />
      )}
    </>
  );
};

export default DocumentCard;
