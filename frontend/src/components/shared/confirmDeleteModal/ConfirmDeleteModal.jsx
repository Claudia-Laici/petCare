import { useState } from "react";
import { Alert, Button, Modal, Spinner } from "react-bootstrap";
import { Trash3 } from "react-bootstrap-icons";

const ConfirmDeleteModal = ({ show, onHide, title, itemName, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError("");

    try {
      await onConfirm();
      onHide();
    } catch (err) {
      setError(err.message || "Impossibile completare l'eliminazione.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => !isDeleting && onHide()}
      onExited={() => setError("")}
      chiuso
      centered
    >
      <Modal.Header closeButton={!isDeleting}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          Vuoi davvero eliminare <strong>{itemName}</strong>?
        </p>
        <p className="text-muted small mb-0">
          Questa operazione non può essere annullata.
        </p>

        {error && (
          <Alert variant="danger" className="mt-3 mb-0">
            {error}
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="outline-secondary"
          className="rounded-pill"
          onClick={onHide}
          disabled={isDeleting}
        >
          Annulla
        </Button>

        <Button
          variant="danger"
          className="rounded-pill"
          onClick={handleConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Eliminazione...
            </>
          ) : (
            <>
              <Trash3 size={15} className="me-2" />
              Elimina
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDeleteModal;