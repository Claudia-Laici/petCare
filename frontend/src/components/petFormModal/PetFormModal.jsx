import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Form,
  Image,
  Modal,
  Spinner,
} from "react-bootstrap";
import { apiFetch } from "../../utils/apiFetch";

const initialFormData = {
  name: "",
  species: "dog",
  breed: "",
  birthDate: "",
  sex: "unknown",
  microchipNumber: "",
  sterilized: false,
};

const fallbackAvatar =
  "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&auto=format&fit=crop&q=60";

const PetFormModal = (props) => (
  <PetFormModalContent
    key={`${props.show}-${props.pet?._id ?? "new"}`}
    {...props}
  />
);

const PetFormModalContent = ({
  show,
  onHide,
  onSaved,
  pet = null,
}) => {
  const [formData, setFormData] = useState(() =>
    pet
      ? {
          name: pet.name || "",
          species: pet.species || "other",
          breed: pet.breed || "",
          birthDate: pet.birthDate
            ? new Date(pet.birthDate).toISOString().split("T")[0]
            : "",
          sex: pet.sex || "unknown",
          microchipNumber: pet.microchipNumber || "",
          sterilized: Boolean(pet.sterilized),
        }
      : { ...initialFormData },
  );

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [savedPetId, setSavedPetId] = useState(null);

  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (!avatarPreview) return;

    return () => URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAvatarSelection = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Seleziona un'immagine JPG, PNG o WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("L'immagine non può superare i 5 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setFormData({ ...initialFormData });
    setError("");
    setSelectedAvatar(null);
    setAvatarPreview(null);
    setSavedPetId(null);

    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }

    onHide();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        breed: formData.breed.trim(),
        birthDate: formData.birthDate || null,
        microchipNumber: formData.microchipNumber.trim(),
      };

      const targetPetId = pet?._id || savedPetId;

      const response = await apiFetch(
        targetPetId ? `/pets/${targetPetId}` : "/pets",
        {
          method: targetPetId ? "PATCH" : "POST",
          body: payload,
        },
      );

      const responsePet = response?.pet ?? response?.data ?? response;
      const currentPetId = responsePet?._id || targetPetId;

      if (!currentPetId) {
        throw new Error(
          "Impossibile recuperare i dati dell'animale salvato.",
        );
      }

      const savedPet = {
        ...responsePet,
        _id: currentPetId,
      };

      if (!targetPetId) {
        setSavedPetId(currentPetId);
      }

      if (selectedAvatar) {
        const avatarData = new FormData();
        avatarData.append("avatar", selectedAvatar);

        try {
          await apiFetch(`/pets/${currentPetId}/avatar`, {
            method: "PATCH",
            body: avatarData,
          });
        } catch {
          await onSaved?.(savedPet);

          setError(
            "Profilo salvato, ma non è stato possibile caricare la foto. Puoi riprovare.",
          );

          return;
        }
      }

      await onSaved?.(savedPet);
      onHide();
    } catch (err) {
      setError(
        err.message || "Non è stato possibile salvare il profilo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarSrc =
    avatarPreview || pet?.cover || fallbackAvatar;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop={isSubmitting ? "static" : true}
      keyboard={!isSubmitting}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title className="fs-5 fw-semibold">
            {pet ? "Modifica profilo" : "Aggiungi un animale"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && (
            <Alert variant="danger" className="small">
              {error}
            </Alert>
          )}

          <div className="text-center mb-4">
            <Image
              src={avatarSrc}
              roundedCircle
              width={100}
              height={100}
              className="object-fit-cover border shadow-sm mb-2"
              alt={
                pet?.name
                  ? `Foto di ${pet.name}`
                  : "Anteprima della foto dell'animale"
              }
            />

            <div>
              <Form.Control
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarSelection}
                className="d-none"
                disabled={isSubmitting}
              />

              <Button
                type="button"
                variant="outline-secondary"
                size="sm"
                className="rounded-pill"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isSubmitting}
              >
                Cambia foto
              </Button>
            </div>

            <Form.Text className="d-block">
              JPG, PNG o WebP · massimo 5 MB
            </Form.Text>
          </div>

          <Form.Group className="mb-3" controlId="petName">
            <Form.Label>Nome *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Es. Achille"
              maxLength={80}
              required
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="petSpecies">
            <Form.Label>Specie *</Form.Label>
            <Form.Select
              name="species"
              value={formData.species}
              onChange={handleChange}
              required
            >
              <option value="dog">Cane</option>
              <option value="cat">Gatto</option>
              <option value="rabbit">Coniglio</option>
              <option value="bird">Uccello</option>
              <option value="reptile">Rettile</option>
              <option value="rodent">Roditore</option>
              <option value="other">Altro</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="petBreed">
            <Form.Label>Razza</Form.Label>
            <Form.Control
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              placeholder="Es. Labrador"
              maxLength={100}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="petBirthDate">
            <Form.Label>Data di nascita</Form.Label>
            <Form.Control
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="petSex">
            <Form.Label>Sesso</Form.Label>
            <Form.Select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
            >
              <option value="unknown">Non specificato</option>
              <option value="male">Maschio</option>
              <option value="female">Femmina</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="petMicrochip">
            <Form.Label>Numero microchip</Form.Label>
            <Form.Control
              type="text"
              name="microchipNumber"
              value={formData.microchipNumber}
              onChange={handleChange}
              placeholder="Facoltativo"
              maxLength={100}
            />
          </Form.Group>

          <Form.Check
            type="checkbox"
            name="sterilized"
            id="petSterilized"
            label="Animale sterilizzato"
            checked={formData.sterilized}
            onChange={handleChange}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="outline-secondary"
            className="rounded-pill"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Annulla
          </Button>

          <Button
            type="submit"
            variant="success"
            className="rounded-pill px-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Salvataggio...
              </>
            ) : pet ? (
              "Salva modifiche"
            ) : (
              "Aggiungi animale"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PetFormModal;