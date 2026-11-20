import StatusBadge from "../../../statusBadge/StatusBadge";
import IconActionButton from "../../../shared/iconActionButton/IconActionButton";
import { formatDate } from "../../../../utils/dateUtils";
import { VACCINATION_STATUS } from "../../../../utils/vaccinationUtils";
import "./VaccinationItemCard.css";

const VaccinationItemCard = ({
  vaccination,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}) => {
  const status =
    VACCINATION_STATUS[vaccination.state] ?? VACCINATION_STATUS.single;

  return (
    <article className="vaccination-item">
      <div className="d-flex flex-wrap align-items-start gap-3">
        <div className="flex-grow-1 min-w-0">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
            <h5 className="vaccination-item-title mb-0">{vaccination.name}</h5>

            <StatusBadge status={status} />
          </div>

          <p className="vaccination-item-subtitle mb-3">
            {vaccination.petName}
          </p>

          <div className="d-flex flex-wrap gap-3 vaccination-item-details">
            <span>
              Somministrazione: {formatDate(vaccination.dateAdministered)}
            </span>

            {vaccination.nextDueDate && (
              <span>Richiamo: {formatDate(vaccination.nextDueDate)}</span>
            )}
          </div>
        </div>

        {(canEdit || canDelete) && (
          <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
            {canEdit && (
              <IconActionButton
                action="edit"
                label="Modifica vaccinazione"
                onClick={() => onEdit(vaccination)}
              />
            )}

            {canDelete && (
              <IconActionButton
                action="delete"
                label="Elimina vaccinazione"
                onClick={() => onDelete(vaccination)}
              />
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default VaccinationItemCard;
