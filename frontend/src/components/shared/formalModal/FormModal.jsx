import { Modal, Form } from "react-bootstrap";
import "../../../styles/variables.css";
import "./FormModal.css";

const FormModal = ({
  show,
  onHide,
  title,
  subtitle,
  children,
  footer,
  onSubmit,
  size = "lg",
  centered = true,
  scrollable = true,
  className = "",
  bodyClassName = "",
  closeButton = true,
  backdrop = true,
  keyboard = true,
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size={size}
      centered={centered}
      scrollable={scrollable}
      className={`form-modal ${className}`}
      backdrop={backdrop}
      keyboard={keyboard}
    >
      <Form
        onSubmit={onSubmit}
        className="d-flex flex-column mh-100 overflow-hidden"
      >
        <Modal.Header closeButton={closeButton}>
          <div className="flex-grow-1 text-break">
            <Modal.Title>{title}</Modal.Title>
            {subtitle && <p className="form-modal-subtitle">{subtitle}</p>}
          </div>
        </Modal.Header>

        <Modal.Body className={bodyClassName}>{children}</Modal.Body>

        {footer && <Modal.Footer>{footer}</Modal.Footer>}
      </Form>
    </Modal>
  );
};

export default FormModal;