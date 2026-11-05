import { Fragment } from "react";
import { Card, ListGroup } from "react-bootstrap";
import "./HealthRecordsCard.css";

const HealthRecordsCard = ({
  title,
  items = [],
  isLoading = false,
  loadingMessage = "Caricamento...",
  emptyMessage = "Nessun elemento presente.",
  headerActions,
  footerContent,
  renderItem,
  className = "",
  maxItems = 3,
}) => {
  const visibleItems = items.slice(0, maxItems);

  return (
    <Card
      className={`health-records-card ${className} border-0 shadow-sm rounded-4 p-4 h-100`}
    >
      <Card.Body className="p-0">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0 fs-6">{title}</h5>
          <div>{headerActions}</div>
        </div>

        {isLoading ? (
          <p className="text-secondary small mb-0 py-3">{loadingMessage}</p>
        ) : visibleItems.length > 0 ? (
          <ListGroup variant="flush">
            {visibleItems.map((item) => (
              <Fragment key={item._id}>{renderItem(item)}</Fragment>
            ))}
          </ListGroup>
        ) : (
          <p className="text-secondary small mb-0 py-3">{emptyMessage}</p>
        )}
      </Card.Body>

      {footerContent && <div className="mt-4">{footerContent}</div>}
    </Card>
  );
};

export default HealthRecordsCard;
