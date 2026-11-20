import { Form } from "react-bootstrap";
import "./PetFilter.css";

const PetFilter = ({
  pets = [],
  selectedPet,
  onChange,
  className = "",
}) => {
  return (
    <Form.Select
      className={`pet-filter ${className}`}
      aria-label="Filtra per animale"
      value={selectedPet}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="all">Tutti gli animali</option>

      {pets.map((pet) => (
        <option key={pet._id} value={pet._id}>
          {pet.name}
        </option>
      ))}
    </Form.Select>
  );
};

export default PetFilter;