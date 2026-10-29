import { Card, ListGroup, Button, Image } from "react-bootstrap";
import { Plus, Download } from "react-bootstrap-icons";
import "./Sidebar.css";

const Sidebar = ({
  pets,
  selectedPetId,
  onSelectPet,
  onAddPet,
}) => {
  return (
    <aside className="sidebar-container d-flex flex-column gap-4 mt-3">
      <Card className="border-0 shadow-sm rounded-4 p-3">
        <Card.Title className="fs-6 fw-semibold text-dark mb-3 px-1">
          I miei animali
        </Card.Title>

        <ListGroup variant="flush" className="gap-2 mb-3">
          {pets.map((pet) => (
            <ListGroup.Item
              key={pet._id}
              action
              active={selectedPetId === pet._id}
              onClick={() => onSelectPet(pet._id)}
              className={`pet-item d-flex align-items-center gap-3 border-0 rounded-3 px-3 py-2 ${
                selectedPetId === pet._id ? "active-pet" : ""
              }`}
            >
              <Image
                src={pet.cover || "/images/pet-placeholder.webp"}
                roundedCircle
                width={36}
                height={36}
                className="object-fit-cover flex-shrink-0"
                alt={pet.name}
              />

              <span className="fw-medium text-dark small">
                {pet.name}
              </span>
            </ListGroup.Item>
          ))}
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

      <Card className="border-0 shadow-sm rounded-4 p-4 qr-card text-center text-white">
        <Card.Title className="fs-6 fw-semibold mb-3">
          Scheda rapida
        </Card.Title>

        <div className="qr-wrapper bg-white rounded-4 mx-auto mb-3 d-flex align-items-center justify-content-center">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PetCareLuna"
            alt="QR Code"
            className="img-fluid"
          />
        </div>

        <p className="qr-description mb-4">
          Scansiona per vedere allergie, terapie e contatti d'emergenza.
        </p>

        <Button
          variant="light"
          className="btn-download w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
        >
          <Download size={16} />
          <span>Scarica QR</span>
        </Button>
      </Card>
    </aside>
  );
};

export default Sidebar;
