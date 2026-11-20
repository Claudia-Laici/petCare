import { useEffect, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import {
  Calendar3,
  Download,
  Eye,
  FileEarmarkMedical,
  FilePdf,
} from "react-bootstrap-icons";
import { apiFetch, apiFetchBlob } from "../../../utils/apiFetch";
import { isImageDocument, isPdfDocument } from "../../../utils/documentFormats";
import { DOCUMENT_TYPE_LABELS } from "../../../utils/documentTypes";
import ConfirmDeleteModal from "../../shared/confirmDeleteModal/ConfirmDeleteModal";
import DocumentPreviewModal from "../documentPreviewModal/DocumentPreviewModal";
import IconActionButton from "../../shared/iconActionButton/IconActionButton";
import "./DocumentCard.css";

const formatDate = (date) => {
  if (!date) return "Data non disponibile";

  return new Date(date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const fetchPreviewUrl = async (id) => {
  const blob = await apiFetchBlob(`/medical-documents/${id}/preview`);
  return URL.createObjectURL(blob);
};

const DocumentCard = ({
  document: doc,
  canEdit = false,
  canDelete = false,
  canDownload = false,
  onEdit,
  onDeleted,
}) => {
  const isImage = isImageDocument(doc);
  const isPdf = isPdfDocument(doc);
  const PlaceholderIcon = isPdf ? FilePdf : FileEarmarkMedical;

  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(isImage);
  const [isOpeningPreview, setIsOpeningPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const isPreviewBusy = isOpeningPreview || isLoadingPreview;

  useEffect(() => {
    if (!isImage) return;

    let isMounted = true;

    fetchPreviewUrl(doc._id)
      .then((url) => {
        if (isMounted) {
          setPreviewUrl(url);
        } else {
          URL.revokeObjectURL(url);
        }
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

  useEffect(() => {
    if (!previewUrl) return;

    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleOpenPreview = async () => {
    if (isPreviewBusy) return;

    setPreviewError("");
    setIsOpeningPreview(true);

    try {
      const url = previewUrl || (await fetchPreviewUrl(doc._id));

      if (!previewUrl) setPreviewUrl(url);

      setShowPreview(true);
    } catch (error) {
      setPreviewError(error.message || "Impossibile aprire il documento.");
    } finally {
      setIsOpeningPreview(false);
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setPreviewError("");

    try {
      const data = await apiFetch(`/medical-documents/${doc._id}/access-url`);

      window.location.href = data.url;
    } catch (error) {
      setPreviewError(error.message || "Impossibile scaricare il documento.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    await apiFetch(`/medical-documents/${doc._id}`, {
      method: "DELETE",
    });

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
              <PlaceholderIcon size={48} />
              <span>{isPdf ? "Documento PDF" : "Documento"}</span>
            </div>
          )}

          {isLoadingPreview && (
            <div className="document-card-loading">
              <Spinner animation="border" size="sm" />
            </div>
          )}
        </div>

        <div className="document-card-body">
          <div className="document-card-heading">
            <div className="document-card-info">
              <span
                className={`document-card-type document-type-${doc.documentType}`}
              >
                {DOCUMENT_TYPE_LABELS[doc.documentType] || "Documento"}
              </span>

              {doc.format && (
                <span className="document-card-format">
                  {doc.format.toUpperCase()}
                </span>
              )}
            </div>

            {canDownload && (
              <button
                type="button"
                className="document-card-btn document-card-btn-round"
                onClick={handleDownload}
                disabled={isDownloading}
                title="Scarica documento"
                aria-label="Scarica documento"
              >
                {isDownloading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <Download size={17} />
                )}
              </button>
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
            <button
              type="button"
              className="document-card-btn document-card-btn-pill"
              onClick={handleOpenPreview}
              disabled={isPreviewBusy}
            >
              {isOpeningPreview ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                  <Eye size={15} />
                  Apri documento
                </>
              )}
            </button>

            {canEdit && (
              <IconActionButton
                action="edit"
                label="Modifica documento"
                onClick={onEdit}
              />
            )}

            {canDelete && (
              <IconActionButton
                action="delete"
                label="Elimina documento"
                onClick={() => setShowDeleteModal(true)}
              />
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

      {canDelete && (
        <ConfirmDeleteModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          title="Elimina documento"
          itemName={doc.title}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};

export default DocumentCard;