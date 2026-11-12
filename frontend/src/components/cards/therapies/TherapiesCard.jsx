import { ListGroup } from "react-bootstrap";
import { CalendarEvent, Capsule } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { parseDate, formatDate } from "../../../utils/dateUtils";
import HealthRecordsCard from "../../healthRecordsCard/HealthRecordsCard";
import { useSortedByStatus, startOfToday } from "../../../utils/statusUtils";
import StatusBadge from "../../statusBadge/StatusBadge";
import ActionButton from "../../shared/actionButton/ActionButton";

const STATUS = {
  ongoing: { label: "In corso", variant: "success", priority: 0 },
  scheduled: { label: "Programmato", variant: "info", priority: 1 },
  ended: { label: "Terminato", variant: "secondary", priority: 2 },
  unknown: {
    label: "Stato non disponibile",
    variant: "secondary",
    priority: 3,
  },
};

const getTherapyStatus = (therapy) => {
  const today = startOfToday();

  const startDate = parseDate(therapy.startDate);
  const endDate = parseDate(therapy.endDate);

  if (!startDate) return STATUS.unknown;

  if (startDate > today) {
    return STATUS.scheduled;
  }

  if (endDate && endDate < today) {
    return STATUS.ended;
  }

  return STATUS.ongoing;
};

const getTherapySortTime = (therapy) =>
  parseDate(therapy.startDate)?.getTime() ?? 0;

const NO_THERAPIES = [];
const TherapiesCard = ({
  therapies = NO_THERAPIES,
  isLoading = false,
  onAddClick,
  petId,
}) => {
  const items = useSortedByStatus(
    therapies,
    getTherapyStatus,
    getTherapySortTime,
    "desc",
  );

  return (
    <HealthRecordsCard
      title="Terapie"
      items={items}
      isLoading={isLoading}
      loadingMessage="Caricamento terapie..."
      emptyMessage="Non sono ancora presenti terapie per questo animale."
      className="therapies-card"
      headerActions={
        onAddClick && (
          <ActionButton onClick={onAddClick}>+ Aggiungi</ActionButton>
        )
      }
      footerContent={
        petId && (
          <div className="text-center card-custom-footer pt-2 border-top">
            <Link
              to={`/pets/${petId}/therapies`}
              className="d-block py-2 text-decoration-none small fw-medium"
            >
              Vedi tutte le terapie →
            </Link>
          </div>
        )
      }
      renderItem={(item) => {
        const { status } = item;

        return (
          <ListGroup.Item className="px-0 py-3">
            <div className="d-flex justify-content-between align-items-start gap-2">
              <div className="therapy-info">
                <h6 className="fw-semibold text-dark mb-1 small">
                  {item.name}
                </h6>

                <div className="therapy-dosage d-flex align-items-center text-secondary gap-1 small mb-1">
                  <Capsule size={12} />
                  <span>
                    {item.dosage || "Dosaggio non specificato"}
                    {item.frequency ? ` · ${item.frequency}` : ""}
                  </span>
                </div>

                <div className="therapy-date d-flex align-items-center text-secondary gap-1 small">
                  <CalendarEvent size={12} />
                  <span>
                    {formatDate(item.startDate)}
                    {" – "}
                    {item.endDate
                      ? formatDate(item.endDate)
                      : status === STATUS.ongoing
                        ? "In corso"
                        : "Senza data di fine"}
                  </span>
                </div>
              </div>

              <StatusBadge status={status} />
            </div>
          </ListGroup.Item>
        );
      }}
    />
  );
};

export default TherapiesCard;
