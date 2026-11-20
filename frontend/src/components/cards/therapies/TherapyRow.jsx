import { CalendarEvent, Capsule } from "react-bootstrap-icons";
import IconActionButton from "../../shared/iconActionButton/IconActionButton";
import StatusBadge from "../../statusBadge/StatusBadge";
import { formatDate } from "../../../utils/dateUtils";

const TherapyRow = ({
  therapy,
  petName,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}) => (
  <article className="therapy-page-card">
    <div className="therapy-page-card-main">
      <div className="therapy-page-icon">
        <Capsule size={20} />
      </div>

      <div className="therapy-page-info">
        <div className="therapy-page-heading">
          <h2>{therapy.name}</h2>
          <StatusBadge status={therapy.status} />
        </div>

        <p className="therapy-page-pet">{petName}</p>

        <div className="therapy-page-details">
          <span>
            <Capsule size={14} />
            {therapy.dosage || "Dosaggio non specificato"}
          </span>

          <span>{therapy.frequency}</span>

          <span>
            <CalendarEvent size={14} />
            {formatDate(therapy.startDate)} –{" "}
            {therapy.endDate
              ? formatDate(therapy.endDate)
              : "Senza data di fine"}
          </span>
        </div>

        {therapy.veterinarian && (
          <p className="therapy-page-vet">
            Veterinario: {therapy.veterinarian}
          </p>
        )}
      </div>
    </div>

    {(canEdit || canDelete) && (
      <div className="therapy-page-actions">
        {canEdit && (
          <IconActionButton
            action="edit"
            label="Modifica terapia"
            onClick={() => onEdit(therapy)}
          />
        )}

        {canDelete && (
          <IconActionButton
            action="delete"
            label="Elimina terapia"
            onClick={() => onDelete(therapy)}
          />
        )}
      </div>
    )}
  </article>
);

export default TherapyRow;
