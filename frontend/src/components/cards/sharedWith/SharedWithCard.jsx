import { ListGroup } from "react-bootstrap";
import { PersonPlus, Person } from "react-bootstrap-icons";
import { formatDate } from "../../../utils/dateUtils";
import { Link, useParams } from "react-router-dom";
import HealthRecordsCard from "../../healthRecordsCard/HealthRecordsCard";
import ActionButton from "../../shared/actionButton/ActionButton";
import "../../../styles/variables.css";
import "../../../styles/components.css";
import "./SharedWithCard.css";

const SharedWithCard = ({
  sharedWith = [],
  isLoading = false,
  onInviteClick,
}) => {
  const { petId } = useParams();

  return (
    <HealthRecordsCard
      title="Condiviso con"
      items={sharedWith}
      isLoading={isLoading}
      loadingMessage="Caricamento condivisioni..."
      emptyMessage="Non hai ancora condiviso il profilo con altre persone."
      maxItems={10}
      className="shared-with-card"
      headerActions={
        <ActionButton onClick={onInviteClick}>
          <PersonPlus size={15} />
          <span>Invita</span>
        </ActionButton>
      }
      footerContent={
        <div className="text-center card-custom-footer pt-2 border-top">
          <Link
            to={`/pets/${petId}/shares`}
            className="d-block py-2 text-decoration-none small fw-medium"
          >
            Vedi tutte le condivisioni →
          </Link>
        </div>
      }
            renderItem={(share) => {
        const isPending = share.status === "pending";
        const user = share.user;

        return (
          <ListGroup.Item
            key={share._id}
            className="shared-with-item px-0 py-2 d-flex align-items-center gap-3"
          >
            <div className="shared-with-avatar d-flex align-items-center justify-content-center flex-shrink-0 text-dark">
              <Person size={20} />
            </div>

            <div className="flex-grow-1 shared-with-info">
              <div className="fw-semibold text-dark small">
                {isPending ? share.email : `${user?.nome} ${user?.cognome}`}
              </div>

              {isPending ? (
                <div className="text-muted-small">
                  In attesa di registrazione
                </div>
              ) : (
                <div className="shared-with-email text-muted-small">
                  {user?.email}
                </div>
              )}

              {share.expiresAt && (
                <div className="text-muted-small">
                  Accesso fino al {formatDate(share.expiresAt)}
                </div>
              )}
            </div>

            <span className="shared-with-role text-secondary">
              {share.role === "editor" ? "Editor" : "Lettura"}
            </span>
          </ListGroup.Item>
        );
      }}
    />
  );
};

export default SharedWithCard;
