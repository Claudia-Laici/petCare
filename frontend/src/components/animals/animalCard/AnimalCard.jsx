import { Card, Image } from "react-bootstrap";
import { ArrowRight } from "react-bootstrap-icons";
import petPlaceholder from "../../../assets/petPlaceholder/petPlaceholder.webp";
import ActionButton from "../../shared/actionButton/ActionButton";
import IconActionButton from "../../shared/iconActionButton/IconActionButton";
import "./AnimalCard.css";

const SPECIES_LABELS = {
  dog: "Cane",
  cat: "Gatto",
  rabbit: "Coniglio",
  bird: "Uccello",
  reptile: "Rettile",
  rodent: "Roditore",
  other: "Altro",
};

const getAge = (birthDate) => {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  const today = new Date();

  if (Number.isNaN(birth.getTime()) || birth > today) return null;

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (today.getDate() < birth.getDate()) months--;

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years > 0) return `${years} ${years === 1 ? "anno" : "anni"}`;

  return `${months} ${months === 1 ? "mese" : "mesi"}`;
};

const AnimalCard = ({
  pet,
  isOwner,
  canEdit,
  onOpen,
  onEdit,
  onDelete,
}) => {
  if (!pet) return null;

  const species = SPECIES_LABELS[pet.species] || "Animale";
  const age = getAge(pet.birthDate);

  return (
    <Card className="animal-card h-100 border-0">
      <div className="animal-card-image-wrapper">
        <Image
          src={pet.cover || petPlaceholder}
          alt={`Foto di ${pet.name}`}
          className="animal-card-image"
        />

        <span
          className={`animal-card-role ${
            isOwner ? "animal-card-role-owner" : "animal-card-role-shared"
          }`}
        >
          {isOwner ? "Di proprietà" : "Condiviso"}
        </span>
      </div>

      <Card.Body className="animal-card-body">
        <div className="animal-card-heading">
          <div className="min-w-0">
            <h3 className="animal-card-name">{pet.name}</h3>
            <p className="animal-card-species">
              {species}
              {pet.breed ? ` · ${pet.breed}` : ""}
            </p>
          </div>

          <div className="animal-card-actions">
            {canEdit && (
              <IconActionButton
                action="edit"
                label={`Modifica ${pet.name}`}
                onClick={onEdit}
              />
            )}

            {isOwner && (
              <IconActionButton
                action="delete"
                label={`Elimina ${pet.name}`}
                onClick={onDelete}
              />
            )}
          </div>
        </div>

        <div className="animal-card-details">
          {age && (
            <span>
              <strong>Età</strong>
              {age}
            </span>
          )}

          {pet.sex && (
            <span>
              <strong>Sesso</strong>
              {pet.sex === "male" ? "Maschio" : pet.sex === "female" ? "Femmina" : pet.sex}
            </span>
          )}
        </div>

        <div className="animal-card-footer">
          <ActionButton onClick={onOpen}>
            Apri profilo
            <ArrowRight size={14} />
          </ActionButton>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AnimalCard;