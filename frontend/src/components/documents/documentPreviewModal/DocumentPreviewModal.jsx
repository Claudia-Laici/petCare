import { Button } from "react-bootstrap";
import { FilePdf } from "react-bootstrap-icons";
import FormModal from "../../shared/formalModal/FormModal";
import DocumentViewer from "../../medicalDocuments/documentViewer/DocumentViewer";

const DocumentPreviewModal = ({ show, onHide, document, url }) => {
  if (!document) return null;

  const isPdf = document.format?.toLowerCase() === "pdf";

  return (
    <FormModal
      show={show}
      onHide={onHide}
      title={document.title}
      size="xl"
      className="document-preview-modal"
      bodyClassName="document-preview-body"
      footer={
        <Button
          type="button"
          variant="outline-secondary"
          className="rounded-pill"
          onClick={onHide}
        >
          Chiudi
        </Button>
      }
    >
      {!url ? (
        <div className="document-preview-empty">
          <FilePdf size={32} />
          <p>Anteprima non disponibile.</p>
        </div>
      ) : isPdf ? (
        <DocumentViewer file={url} />
      ) : (
        <img
          src={url}
          alt={document.title}
          className="document-preview-image"
        />
      )}
    </FormModal>
  );
};

export default DocumentPreviewModal;