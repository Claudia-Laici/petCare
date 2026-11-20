import { ListGroup } from "react-bootstrap";
import { CalendarEvent } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/dateUtils";
import { useSortedByStatus } from "../../../utils/statusUtils";
import { getVaccinationStatus, getVaccinationSortTime, } from "../../../utils/vaccinationUtils";
import HealthRecordsCard from "../../healthRecordsCard/HealthRecordsCard";
import StatusBadge from "../../statusBadge/StatusBadge";
import ActionButton from "../../shared/actionButton/ActionButton";

const VaccinationCard = ({
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
              to="/vaccinations"
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

export default VaccinationCard;