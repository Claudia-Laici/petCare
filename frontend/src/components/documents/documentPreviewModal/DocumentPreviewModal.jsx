import { Button } from "react-bootstrap";
import { FilePdf } from "react-bootstrap-icons";
import FormModal from "../../shared/formalModal/FormModal";

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
        url && (
          <>
            <Button
              type="button"
              variant="outline-secondary"
              className="rounded-pill"
              onClick={onHide}
            >
              Chiudi
            </Button>

            <Button
              as="a"
              href={url}
              target="_blank"
              rel="noreferrer"
              variant="success"
              className="rounded-pill"
            >
              Apri in una nuova scheda
            </Button>
          </>
        )
      }
    >
      {!url ? (
        <div className="document-preview-empty">
          <FilePdf size={32} />
          <p>Anteprima non disponibile.</p>
        </div>
      ) : isPdf ? (
        <iframe
          src={url}
          title={document.title}
          className="document-preview-pdf"
        />
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