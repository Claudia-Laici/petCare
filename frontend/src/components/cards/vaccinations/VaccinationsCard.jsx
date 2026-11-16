import { ListGroup } from "react-bootstrap";
import { CalendarEvent } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { parseDate, formatDate } from "../../../utils/dateUtils";
import HealthRecordsCard from "../../healthRecordsCard/HealthRecordsCard";
import { useSortedByStatus, startOfToday } from "../../../utils/statusUtils";
import StatusBadge from "../../statusBadge/StatusBadge";
import ActionButton from "../../shared/actionButton/ActionButton";

const DAY = 1000 * 60 * 60 * 24;

const STATUS = {
  expiring: { label: "In scadenza", variant: "warning", priority: 0 },
  toAdminister: { label: "Da effettuare", variant: "info", priority: 1 },
  expired: { label: "Scaduto", variant: "danger", priority: 2 },
  upToDate: { label: "In regola", variant: "info", priority: 3 },
  single: { label: "Unica somministrazione", variant: "success", priority: 4 },
  toDefine: {
    label: "Richiamo da definire",
    variant: "secondary",
    priority: 5,
  },
};

const getVaccinationState = (vaccination) => {
  const today = startOfToday();

  const administered = parseDate(vaccination.dateAdministered);
  if (administered && administered > today) return "toAdminister";

  if (vaccination.isSingleDose) return "single";

  const dueDate = parseDate(vaccination.nextDueDate);
  if (!dueDate) return "toDefine";

  const daysRemaining = Math.round((dueDate - today) / DAY);

  if (daysRemaining < 0) return "expired";
  if (daysRemaining <= 30) return "expiring";

  return "upToDate";
};

const getVaccinationStatus = (v) => STATUS[getVaccinationState(v)];

const getVaccinationSortTime = (v) =>
  parseDate(v.nextDueDate || v.dateAdministered)?.getTime() ?? 0;

const VaccinationsCard = ({
  vaccinations = [],
  isLoading = false,
  onAddClick,
  petId,
}) => {
  const items = useSortedByStatus(
    vaccinations,
    getVaccinationStatus,
    getVaccinationSortTime,
  );

  return (
    <HealthRecordsCard
      title="Vaccinazioni"
      items={items}
      isLoading={isLoading}
      loadingMessage="Caricamento vaccinazioni..."
      emptyMessage="Non sono ancora presenti vaccinazioni per questo animale."
      className="vaccinations-card"
      headerActions={
        <ActionButton onClick={onAddClick}>+ Aggiungi</ActionButton>
      }
      footerContent={
        petId && (
          <div className="card-custom-footer text-center pt-2 border-top">
            <Link
              to={`/pets/${petId}/vaccinations`}
              className="d-block py-2 text-decoration-none small fw-medium"
            >
              Vedi tutte le vaccinazioni →
            </Link>
          </div>
        )
      }
      renderItem={(item) => {
        const { status } = item;
        const displayDate = item.nextDueDate || item.dateAdministered;

        return (
          <ListGroup.Item className="px-0 py-3">
            <div className="d-flex justify-content-between align-items-center gap-2">
              <div>
                <h6 className="fw-semibold mb-1">{item.name}</h6>

                <div className="text-date d-flex align-items-center text-secondary gap-1">
                  <CalendarEvent size={12} />
                  <span>{formatDate(displayDate)}</span>
                </div>

                <span className="text-date d-flex align-items-center text-secondary gap-1 small mb-1">
                  {item.nextDueDate
                    ? `Richiamo: ${formatDate(item.nextDueDate)}`
                    : `Somministrazione: ${formatDate(item.dateAdministered)}`}
                </span>
              </div>

              <StatusBadge status={status} />
            </div>
          </ListGroup.Item>
        );
      }}
    />
  );
};

export default VaccinationsCard;
