import { useRef, useState } from "react";
import { Alert, Button, Form, Modal, Row, Col, Spinner } from "react-bootstrap";
import {
  createAppointment,
  updateAppointment,
} from "../../../services/appointments/appointmentService";
import {
  APPOINTMENT_TYPES,
  FIELD_LABELS,
} from "../../../constants/appointments";
import { toDateTimeLocal } from "../../../utils/formatDate";

const initialFormData = {
  pet: "",
  title: "",
  type: "visit",
  startAt: "",
  endAt: "",
  location: "",
  veterinarian: "",
  notes: "",
  vetQuestions: "",
  attendeeInstructions: "",
};

const getInitialFormData = (appointment) =>
  appointment
    ? {
        pet: appointment.pet,
        title: appointment.title,
        type: appointment.type,
        startAt: toDateTimeLocal(appointment.startAt),
        endAt: toDateTimeLocal(appointment.endAt),
        location: appointment.location ?? "",
        veterinarian: appointment.veterinarian ?? "",
        notes: appointment.notes ?? "",
        vetQuestions: appointment.vetQuestions ?? "",
        attendeeInstructions: appointment.attendeeInstructions ?? "",
      }
    : initialFormData;
const AppointmentFormModal = (props) => (
  <AppointmentFormModalContent
    key={props.show ? "open" : "closed"}
    {...props}
  />
);

const AppointmentFormModalContent = ({
  show,
  onHide,
  pets = [],
  onSaved,
  appointment = null,
}) => {
  const [formData, setFormData] = useState(() =>
    getInitialFormData(appointment),
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const idempotencyRef = useRef(null);

  const handleChange = ({ target: { name, value } }) => {
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const bind = (name) => ({
    name,
    value: formData[name],
    onChange: handleChange,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      formData.endAt &&
      new Date(formData.endAt) <= new Date(formData.startAt)
    ) {
      setError("La fine deve essere successiva all'inizio.");
      return;
    }

    const data = {
      pet: formData.pet,
      title: formData.title.trim(),
      type: formData.type,
      startAt: new Date(formData.startAt).toISOString(),
      endAt: formData.endAt ? new Date(formData.endAt).toISOString() : null,
      location: formData.location.trim(),
      veterinarian: formData.veterinarian.trim(),
      notes: formData.notes.trim(),
      vetQuestions: formData.vetQuestions.trim(),
      attendeeInstructions: formData.attendeeInstructions.trim(),
    };

    setIsSubmitting(true);

    try {
      let saved;

      if (appointment) {
        saved = await updateAppointment(appointment._id, data);
      } else {
        const signature = JSON.stringify(data);

        if (idempotencyRef.current?.signature !== signature) {
          idempotencyRef.current = { signature, key: crypto.randomUUID() };
        }

        saved = await createAppointment(data, idempotencyRef.current.key);
      }

      await onSaved?.(saved);
      onHide();
    } catch (err) {
      setError(
        err.message ||
          (appointment
            ? "Non è stato possibile aggiornare l'appuntamento."
            : "Non è stato possibile creare l'appuntamento."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      backdrop={isSubmitting ? "static" : true}
      keyboard={!isSubmitting}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title className="fs-5 fw-semibold">
            {appointment ? "Modifica appuntamento" : "Nuovo appuntamento"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && (
            <Alert variant="danger" className="small">
              {error}
            </Alert>
          )}

          {pets.length === 0 && (
            <Alert variant="warning">
              Devi prima aggiungere un animale per creare un appuntamento.
            </Alert>
          )}

          <Form.Group className="mb-3" controlId="appointmentPet">
            <Form.Label>Animale *</Form.Label>
            <Form.Select
              {...bind("pet")}
              required
              disabled={isSubmitting || pets.length === 0}
            >
              <option value="">Seleziona un animale</option>
              {pets.map((pet) => (
                <option key={pet._id} value={pet._id}>
                  {pet.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="appointmentTitle">
            <Form.Label>Titolo *</Form.Label>
            <Form.Control
              {...bind("title")}
              placeholder="Es. Controllo veterinario"
              maxLength={150}
              required
              disabled={isSubmitting}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="appointmentType">
            <Form.Label>Tipologia</Form.Label>
            <Form.Select {...bind("type")} disabled={isSubmitting}>
              {Object.entries(APPOINTMENT_TYPES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="appointmentStart">
                <Form.Label>Data e ora di inizio *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  {...bind("startAt")}
                  required
                  disabled={isSubmitting}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="appointmentEnd">
                <Form.Label>Data e ora di fine</Form.Label>
                <Form.Control
                  type="datetime-local"
                  {...bind("endAt")}
                  min={formData.startAt || undefined}
                  disabled={isSubmitting}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="appointmentLocation">
            <Form.Label>Luogo</Form.Label>
            <Form.Control
              {...bind("location")}
              placeholder="Es. Clinica veterinaria"
              disabled={isSubmitting}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="appointmentVeterinarian">
            <Form.Label>Veterinario</Form.Label>
            <Form.Control
              {...bind("veterinarian")}
              placeholder="Nome del veterinario"
              disabled={isSubmitting}
            />
          </Form.Group>

          <Form.Group controlId="appointmentNotes">
            <Form.Label>{FIELD_LABELS.notes}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              {...bind("notes")}
              placeholder="Aggiungi eventuali informazioni..."
              disabled={isSubmitting}
            />
          </Form.Group>

          <hr className="my-4" />

          <div className="mb-3">
            <h6 className="fw-semibold mb-1">Informazioni aggiuntive</h6>
            <p className="text-muted small mb-0">
              Aggiungi dettagli utili per preparare la visita o per chi
              accompagnerà l'animale.
            </p>
          </div>

          <Form.Group className="mb-3" controlId="appointmentVetQuestions">
            <Form.Label>{FIELD_LABELS.vetQuestions}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              maxLength={1000}
              {...bind("vetQuestions")}
              placeholder="Es. Chiedere informazioni sulla terapia e sui prossimi controlli..."
              disabled={isSubmitting}
            />
            <Form.Text className="text-muted">
              Annotati gli argomenti da affrontare durante la visita.
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="appointmentAttendeeInstructions">
            <Form.Label>{FIELD_LABELS.attendeeInstructions}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              maxLength={1000}
              {...bind("attendeeInstructions")}
              placeholder="Es. Portare il libretto sanitario, arrivare 10 minuti prima..."
              disabled={isSubmitting}
            />
            <Form.Text className="text-muted">
              Informazioni pratiche per chi si occuperà di accompagnare
              l'animale.
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="outline-secondary"
            className="rounded-pill"
            onClick={onHide}
            disabled={isSubmitting}
          >
            Annulla
          </Button>

          <Button
            type="submit"
            variant="success"
            className="rounded-pill px-4"
            disabled={isSubmitting || pets.length === 0}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Salvataggio...
              </>
            ) : appointment ? (
              "Salva modifiche"
            ) : (
              "Crea appuntamento"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AppointmentFormModal;
