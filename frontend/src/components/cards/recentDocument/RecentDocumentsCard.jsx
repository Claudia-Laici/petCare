import { ListGroup, Button } from "react-bootstrap";
import { FileEarmarkText, Upload, Download } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/dateUtils";
import { apiFetch } from "../../../utils/apiFetch";
import HealthRecordsCard from "../../healthRecordsCard/HealthRecordsCard";
import ActionButton from "../../shared/actionButton/ActionButton";
import "./RecentDocumentsCard.css";

const RecentDocumentsCard = ({
  documents = [],
  isLoading = false,
  onUploadClick,
  canEdit = false,
  canDownload = false,
}) => {
  const handleDownload = async (documentId) => {
    try {
      const data = await apiFetch(
        `/medical-documents/${documentId}/access-url`,
      );

      const link = document.createElement("a");
      link.href = data.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
    } catch (error) {
      console.error("Errore durante il download:", error);
    }
  };

  const sortedDocuments = [...documents].sort(
    (a, b) =>
      new Date(b.createdAt || b.documentDate || 0) -
      new Date(a.createdAt || a.documentDate || 0),
  );

  return (
    <HealthRecordsCard
      title="Documenti recenti"
      items={sortedDocuments}
      isLoading={isLoading}
      loadingMessage="Caricamento documenti..."
      emptyMessage="Non hai ancora caricato documenti veterinari."
      maxItems={3}
      className="recent-documents-card"
      headerActions={
        canEdit &&
        onUploadClick && (
          <ActionButton onClick={onUploadClick}>
            <Upload size={15} />
            <span>Carica</span>
          </ActionButton>
        )
      }
      footerContent={
        <div className="text-center card-custom-footer pt-2 border-top">
          <Link
            to="/documents"
            className="d-block py-2 text-decoration-none small fw-medium"
          >
            Vedi tutti i documenti →
          </Link>
        </div>
      }
      renderItem={(doc) => (
        <ListGroup.Item
          key={doc._id}
          className="recent-document-item px-0 py-2 d-flex align-items-center gap-3"
        >
          <div className="recent-document-icon d-flex align-items-center justify-content-center rounded-3 text-primary">
            <FileEarmarkText size={20} />
          </div>

          <div className="recent-document-info flex-grow-1">
            <div className="fw-semibold text-dark small">{doc.title}</div>

            <div className="text-date text-secondary">
              {formatDate(doc.documentDate || doc.createdAt)}
            </div>
          </div>

          {canDownload && (
            <Button
              variant="link"
              className="recent-document-options"
              onClick={() => handleDownload(doc._id)}
              title="Scarica referto"
              aria-label={`Scarica ${doc.title}`}
            >
              <Download size={16} />
            </Button>
          )}
        </ListGroup.Item>
      )}
    />
  );
};

export default RecentDocumentsCard;
