
import { CalendarEvent, Clock, GeoAlt, Person } from "react-bootstrap-icons";
import StatusBadge from "../../statusBadge/StatusBadge";
import IconActionButton from "../../shared/iconActionButton/IconActionButton";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
} from "../../../constants/appointments";
import { formatDate, formatTime } from "../../../utils/formatDate";
import "./AppointmentCard.css";

const AppointmentCard = ({
  appointment,
  canEdit,
  onEdit,
  onShare,
  onDelete,
}) => {
  const status =
    APPOINTMENT_STATUSES[appointment.status] ?? APPOINTMENT_STATUSES.scheduled;

  return (
    <article className="appointment-item">
      <div className="d-flex flex-wrap align-items-start gap-3">
        <div className="flex-grow-1 min-w-0">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
            <h5 className="appointment-item-title mb-0">
              {appointment.title}
            </h5>

            <StatusBadge status={status} />
          </div>

          <p className="appointment-item-subtitle mb-3">
            {APPOINTMENT_TYPES[appointment.type] ?? "Altro"}
            <span className="mx-2">·</span>
            {appointment.petName}
          </p>

          <div className="d-flex flex-wrap gap-3 appointment-item-details">
            <span>
              <CalendarEvent />
              {formatDate(appointment.startAt)}
            </span>

            <span>
              <Clock />
              {formatTime(appointment.startAt)}
              {appointment.endAt && ` - ${formatTime(appointment.endAt)}`}
            </span>

            {appointment.location && (
              <span>
                <GeoAlt />
                {appointment.location}
              </span>
            )}

            {appointment.veterinarian && (
              <span>
                <Person />
                Veterinario: {appointment.veterinarian}
              </span>
            )}
          </div>
        </div>

        {canEdit && (
          <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
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

            <IconActionButton
              action="delete"
              label="Elimina appuntamento"
              onClick={() => onDelete(appointment)}
            />
          </div>
        )}
      </div>
    </article>
  );
};

export default AppointmentCard;
