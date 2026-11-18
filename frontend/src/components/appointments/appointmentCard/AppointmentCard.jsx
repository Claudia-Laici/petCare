import { Card } from "react-bootstrap";
import { CalendarEvent, Clock } from "react-bootstrap-icons";
import StatusBadge from "../../statusBadge/StatusBadge";
import IconActionButton from "../../shared/iconActionButton/IconActionButton";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
} from "../../../constants/appointments";
import { formatDate, formatTime } from "../../../utils/formatDate";

const AppointmentCard = ({ appointment, canEdit, onEdit, onShare }) => {
  const status =
    APPOINTMENT_STATUSES[appointment.status] ?? APPOINTMENT_STATUSES.scheduled;

  return (
    <Card className="border-0 shadow-sm rounded-4 card-base">
      <Card.Body className="p-4">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <h5 className="fw-bold mb-0">{appointment.title}</h5>

          <StatusBadge status={status} />

          {canEdit && (
            <div className="ms-auto d-flex align-items-center gap-2 flex-shrink-0">
              <IconActionButton
                action="share"
                label="Condividi appuntamento"
                onClick={() => onShare(appointment)}
              />

              <IconActionButton
                action="edit"
                label="Modifica appuntamento"
                onClick={() => onEdit(appointment)}
              />
            </div>
          )}
        </div>

        <p className="text-muted mb-3">
          {APPOINTMENT_TYPES[appointment.type] ?? "Altro"}
          {" · "}
          {appointment.petName}
        </p>

        <div className="d-flex flex-wrap gap-3 text-muted small">
          <span>
            <CalendarEvent className="me-2" />
            {formatDate(appointment.startAt)}
          </span>

          <span>
            <Clock className="me-2" />
            {formatTime(appointment.startAt)}
            {appointment.endAt && ` - ${formatTime(appointment.endAt)}`}
          </span>
        </div>

        {(appointment.location || appointment.veterinarian) && (
          <div className="mt-3 d-flex flex-column gap-2 text-muted small">
            {appointment.location && <span>{appointment.location}</span>}

            {appointment.veterinarian && (
              <span>Veterinario: {appointment.veterinarian}</span>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AppointmentCard;