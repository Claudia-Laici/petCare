import { useState } from "react";
import { Alert, Button, Card, Image, Modal, Spinner } from "react-bootstrap";
import { PencilFill, Trash3 } from "react-bootstrap-icons";
import { apiFetch } from "../../utils/apiFetch";
import { SPECIES } from "../../constants/pets";
import petPlaceholder from "../../assets/petPlaceholder/petPlaceholder.webp";
import "./ProfileCard.css";

const getAge = (birthDate) => {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  const today = new Date();

  if (Number.isNaN(birth.getTime()) || birth > today) return null;

  let total =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());

  if (today.getDate() < birth.getDate()) total -= 1;

  if (total < 1) return "Meno di un mese";

  const years = Math.floor(total / 12);
  const months = total % 12;

  return [
    years && `${years} ${years === 1 ? "anno" : "anni"}`,
    months && `${months} ${months === 1 ? "mese" : "mesi"}`,
  ]
    .filter(Boolean)
    .join(" e ");
};

const InfoBadge = ({ children, title }) => (
  <span className="profile-card-badge" title={title}>
    {children}
  </span>
);

const ProfileCard = ({ pet, currentUserId, onEdit, onDeleted }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!pet) return null;

  const ownerId = pet.owner?._id ?? pet.owner;
  const isOwner =
    !!currentUserId && String(ownerId) === String(currentUserId);

  const age = getAge(pet.birthDate);

  const openDeleteModal = () => {
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => setShowDeleteModal(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      await apiFetch(`/pets/${pet._id}`, { method: "DELETE" });
      closeDeleteModal();
      await onDeleted?.(pet._id);
    } catch (error) {
      setDeleteError(
        error.message || "Non è stato possibile eliminare l'animale.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="profile-card border-0 shadow-sm rounded-4 mt-3">
        <div className="profile-card-decoration" aria-hidden="true" />

        <div className="profile-card-content d-flex flex-column flex-sm-row align-items-center gap-3 gap-md-4">

          <Image
            src={pet.cover || petPlaceholder}
            roundedCircle
            className="profile-card-avatar"
            alt={`Foto di ${pet.name}`}
          />

          <div className="profile-card-info flex-grow-1 text-center text-sm-start">
            <span className="profile-card-label">
              PROFILO SANITARIO
            </span>

            <h2 className="profile-card-name">
              {pet.name}
            </h2>

            <div className="profile-card-badges d-flex flex-wrap justify-content-center justify-content-sm-start gap-2">
              <InfoBadge>
                {SPECIES[pet.species] ?? "Non specificata"}
              </InfoBadge>

              {pet.breed && <InfoBadge>{pet.breed}</InfoBadge>}

              {age && <InfoBadge>{age}</InfoBadge>}

              {pet.weight > 0 && (
                <InfoBadge>{pet.weight} kg</InfoBadge>
              )}

              {pet.microchipNumber && (
                <InfoBadge title={pet.microchipNumber}>
                  Microchip {pet.microchipNumber}
                </InfoBadge>
              )}
            </div>
          </div>

          <div className="profile-card-actions d-flex align-items-center gap-2">
            <Button
              variant="light"
              className="profile-card-action"
              onClick={onEdit}
              aria-label="Modifica profilo"
              title="Modifica profilo"
            >
              <PencilFill size={15} />
            </Button>

            {isOwner && (
              <Button
                variant="light"
                className="profile-card-action profile-card-action-delete"
                onClick={openDeleteModal}
                aria-label="Elimina animale"
                title="Elimina animale"
              >
                <Trash3 size={15} />
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Modal
        show={showDeleteModal}
        onHide={closeDeleteModal}
        centered
        backdrop={isDeleting ? "static" : true}
        keyboard={!isDeleting}
      >
        <Modal.Header closeButton={!isDeleting}>
          <Modal.Title className="fs-5 fw-semibold">
            Elimina animale
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {deleteError && (
            <Alert variant="danger" className="small">
              {deleteError}
            </Alert>
          )}

          <p>
            Vuoi davvero eliminare il profilo di{" "}
            <strong>{pet.name}</strong>?
          </p>

          <p className="text-danger small mb-0">
            L'operazione eliminerà anche i dati sanitari e i documenti
            associati al profilo. Non può essere annullata.
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            className="rounded-pill"
            onClick={closeDeleteModal}
            disabled={isDeleting}
          >
            Annulla
          </Button>

          <Button
            variant="danger"
            className="rounded-pill px-4"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Eliminazione...
              </>
            ) : (
              "Elimina definitivamente"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProfileCard;