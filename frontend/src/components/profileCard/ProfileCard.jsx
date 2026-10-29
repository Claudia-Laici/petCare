import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Image,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import { PencilFill, Trash3 } from "react-bootstrap-icons";
import { apiFetch } from "../../utils/apiFetch";
import "./ProfileCard.css";

const speciesOptions = [
  { value: "dog", label: "Cane" },
  { value: "cat", label: "Gatto" },
  { value: "rabbit", label: "Coniglio" },
  { value: "bird", label: "Uccello" },
  { value: "reptile", label: "Rettile" },
  { value: "rodent", label: "Roditore" },
  { value: "other", label: "Altro" },
];

const getAge = (birthDate) => {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  if (birth > today) return null;

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (today.getDate() < birth.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years === 0 && months === 0) return "Meno di un mese";

  if (years === 0) {
    return `${months} ${months === 1 ? "mese" : "mesi"}`;
  }

  if (months === 0) {
    return `${years} ${years === 1 ? "anno" : "anni"}`;
  }

  return `${years} ${years === 1 ? "anno" : "anni"} e ${months} ${
    months === 1 ? "mese" : "mesi"
  }`;
};

const getSpeciesLabel = (species) =>
  speciesOptions.find((option) => option.value === species)?.label ||
  "Non specificata";

const ProfileCard = ({ pet, currentUserId, onEdit, onDeleted }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const petOwnerId = pet?.owner?._id ?? pet?.owner;

  const isOwner =
    currentUserId && petOwnerId && String(petOwnerId) === String(currentUserId);

  if (!pet) return null;

  const avatarSrc =
    pet.cover ||
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&auto=format&fit=crop&q=60";

  const age = getAge(pet.birthDate);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      await apiFetch(`/pets/${pet._id}`, {
        method: "DELETE",
      });

      setShowDeleteModal(false);
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
      <Card className="profile-card border-0 shadow-sm rounded-4 p-4 text-white position-relative overflow-hidden mt-3">
        <div className="profile-card-glow position-absolute top-0 end-0 h-100 w-50 rounded-pill pointer-events-none" />

        <Row className="align-items-center position-relative my-2">
          <Col
            xs={12}
            md={8}
            className="d-flex flex-column flex-md-row align-items-center gap-4 mb-3 mb-md-0"
          >
            <div className="text-center">
              <Image
                src={avatarSrc}
                roundedCircle
                width={90}
                height={90}
                className="profile-card-avatar object-fit-cover border border-3 border-white shadow-sm"
                alt={`Foto di ${pet.name}`}
              />
            </div>

            <div className="profile-card-info text-center text-md-start">
              <span className="profile-card-label d-block text-uppercase small opacity-75 mb-1">
                Profilo sanitario
              </span>

              <h2 className="fw-bold mb-2 text-white">{pet.name}</h2>

              <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2 align-items-center small">
                <span className="profile-card-badge rounded-pill px-3 py-1">
                  {getSpeciesLabel(pet.species)}
                </span>

                {pet.breed && (
                  <span className="profile-card-badge rounded-pill px-3 py-1">
                    {pet.breed}
                  </span>
                )}

                {age && (
                  <span className="profile-card-badge rounded-pill px-3 py-1">
                    {age}
                  </span>
                )}

                {pet.weight && (
                  <span className="profile-card-badge rounded-pill px-3 py-1">
                    {pet.weight} kg
                  </span>
                )}

                {pet.microchipNumber && (
                  <span className="profile-card-badge rounded-pill px-3 py-1">
                    Microchip {pet.microchipNumber}
                  </span>
                )}
              </div>
            </div>
          </Col>

          <Col
            xs={12}
            md={4}
            className="d-flex justify-content-center justify-content-md-end align-items-center mt-3 mt-md-0"
          >
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <Button
                variant="light"
                className="profile-card-edit rounded-pill px-4 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm border-0"
                onClick={onEdit}
              >
                <PencilFill size={14} />
                <span>Modifica profilo</span>
              </Button>

              {isOwner && (
                <Button
                  variant="outline-light"
                  className="rounded-pill px-3 py-2 d-flex align-items-center justify-content-center gap-2"
                  onClick={() => {
                    setDeleteError("");
                    setShowDeleteModal(true);
                  }}
                >
                  <Trash3 size={14} />
                  <span>Elimina</span>
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Card>
      <Modal
        show={showDeleteModal}
        onHide={() => {
          if (!isDeleting) setShowDeleteModal(false);
        }}
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
            Vuoi davvero eliminare il profilo di <strong>{pet.name}</strong>?
          </p>

          <p className="text-danger small mb-0">
            L'operazione eliminerà anche i dati sanitari e i documenti associati
            al profilo. Non può essere annullata.
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            className="rounded-pill"
            onClick={() => setShowDeleteModal(false)}
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
