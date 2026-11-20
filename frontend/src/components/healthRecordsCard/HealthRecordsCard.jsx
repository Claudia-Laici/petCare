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
    <Card className={`health-records-card h-100 ${className}`}>
      <Card.Body className="p-0">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{title}</h5>
          <div>{headerActions}</div>
        </div>

        {isLoading ? (
          <p className="health-records-message small mb-0 py-3">
            {loadingMessage}
          </p>
        ) : visibleItems.length > 0 ? (
          <ListGroup variant="flush">
            {visibleItems.map((item) => (
              <Fragment key={item._id}>{renderItem(item)}</Fragment>
            ))}
          </ListGroup>
        ) : (
          <p className="health-records-message small mb-0 py-3">
            {emptyMessage}
          </p>
        )}
      </Card.Body>

      {footerContent && (
        <div className="health-records-footer">{footerContent}</div>
      )}
    </Card>
  );
};

export default HealthRecordsCard;
