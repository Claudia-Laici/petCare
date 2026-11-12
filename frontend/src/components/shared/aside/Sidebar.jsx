import { Card, ListGroup, Button, Image, Dropdown } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import petPlaceholder from "../../../assets/petPlaceholder/petPlaceholder.webp";
import "./Sidebar.css";

const PetRow = ({ pet }) => (
  <>
    <Image
      src={pet.cover || petPlaceholder}
      roundedCircle
      width={44}
      height={44}
      className="object-fit-cover flex-shrink-0"
      alt=""
    />
    <span className="fw-semibold text-dark">{pet.name}</span>
  </>
);

const Sidebar = ({ pets, selectedPetId, onSelectPet, onAddPet }) => {
  const selectedPet = pets.find((pet) => pet._id === selectedPetId);

  return (
    <aside className="sidebar-container d-flex flex-column gap-4 mt-3">
      <Card className="border-0 shadow-sm rounded-4 p-3">
        <Card.Title className="fs-6 fw-semibold text-dark mb-3 px-1">
          I miei animali
        </Card.Title>

        <Dropdown className="d-lg-none mb-3">
          <Dropdown.Toggle
            variant="light"
            className="pet-item active-pet w-100 d-flex align-items-center gap-3 border-0 rounded-3 px-3 py-2"
          >
            {selectedPet ? (
              <span className="d-flex align-items-center gap-3 flex-grow-1 text-start">
                <PetRow pet={selectedPet} />
              </span>
            ) : (
              <span className="flex-grow-1 text-start">
                Seleziona un animale
              </span>
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu
            className="w-100 border-0 shadow"
            style={{ maxHeight: 300, overflowY: "auto" }}
          >
            {pets.map((pet) => (
              <Dropdown.Item
                key={pet._id}
                active={pet._id === selectedPetId}
                onClick={() => onSelectPet(pet._id)}
                className="d-flex align-items-center gap-3 py-2"
              >
                <PetRow pet={pet} />
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <ListGroup variant="flush" className="d-none d-lg-flex gap-2 mb-3">
          {pets.map((pet) => {
            const isSelected = selectedPetId === pet._id;

            return (
              <ListGroup.Item
                key={pet._id}
                action
                active={isSelected}
                onClick={() => onSelectPet(pet._id)}
                className={`pet-item d-flex align-items-center gap-3 border-0 rounded-3 px-3 py-2 ${
                  isSelected ? "active-pet" : ""
                }`}
              >
                <PetRow pet={pet} />
              </ListGroup.Item>
            );
          })}
        </ListGroup>

        <Button
          variant="outline-secondary"
          className="btn-add rounded-pill d-flex align-items-center justify-content-center gap-1 py-2"
          onClick={onAddPet}
        >
          <Plus size={18} />
          <span>Aggiungi</span>
        </Button>
      </Card>
    </aside>
  );
};

export default Sidebar;