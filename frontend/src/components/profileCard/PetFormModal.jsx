import { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Image, Spinner } from "react-bootstrap";
import { SPECIES, SEX } from "../../constants/pets";
import petPlaceholder from "../../assets/petPlaceholder/petPlaceholder.webp";
import { apiFetch } from "../../utils/apiFetch";
import FormModal from "../shared/formalModal/FormModal";

const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const options = (map) =>
  Object.entries(map).map(([value, label]) => (
    <option key={value} value={value}>
      {label}
    </option>
  ));

const toFormData = (pet) => ({
  name: pet?.name ?? "",
  species: pet?.species ?? "dog",
  breed: pet?.breed ?? "",
  birthDate: pet?.birthDate?.slice(0, 10) ?? "",
  sex: pet?.sex ?? "unknown",
  microchipNumber: pet?.microchipNumber ?? "",
  sterilized: Boolean(pet?.sterilized),
});

const Field = ({ label, id, as: Control = Form.Control, ...props }) => (
  <Form.Group className="mb-3" controlId={id}>
    <Form.Label>{label}</Form.Label>
    <Control {...props} />
  </Form.Group>
);

const PetFormModal = (props) => (
  <PetFormModalContent
    key={`${props.show}-${props.pet?._id ?? "new"}`}
    {...props}
  />
);

const PetFormModalContent = ({ show, onHide, onSaved, pet = null }) => {
  const [formData, setFormData] = useState(() => toFormData(pet));
  const [petId, setPetId] = useState(pet?._id ?? null);
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(
    () => () => avatar && URL.revokeObjectURL(avatar.preview),
    [avatar],
  );

  const handleChange = ({ target: { name, value, type, checked } }) =>
    setFormData((data) => ({
      ...data,
      [name]: type === "checkbox" ? checked : value,
    }));

  const bind = (name) => ({
    name,
    value: formData[name],
    onChange: handleChange,
  });

  const handleClose = () => {
    if (isSubmitting) return;
    onHide();
  };

  const handleAvatarSelection = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const problem = !AVATAR_TYPES.includes(file.type)
      ? "Seleziona un'immagine JPG, PNG o WebP."
      : file.size > MAX_AVATAR_SIZE
        ? "L'immagine non può superare i 5 MB."
        : "";

    setError(problem);

    if (problem) {
      event.target.value = "";
      return;
    }

    setAvatar({ file, preview: URL.createObjectURL(file) });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const saved = await apiFetch(petId ? `/pets/${petId}` : "/pets", {
        method: petId ? "PATCH" : "POST",
        body: {
          ...formData,
          name: formData.name.trim(),
          breed: formData.breed.trim(),
          birthDate: formData.birthDate || null,
          microchipNumber: formData.microchipNumber.trim(),
        },
      });

      setPetId(saved._id);

      if (avatar) {
        const body = new FormData();
        body.append("avatar", avatar.file);

        try {
          await apiFetch(`/pets/${saved._id}/avatar`, {
            method: "PATCH",
            body,
          });
        } catch {
          await onSaved?.(saved);
          setError(
            "Profilo salvato, ma non è stato possibile caricare la foto. Puoi riprovare.",
          );
          return;
        }
      }

      await onSaved?.(saved);
      onHide();
    } catch (err) {
      setError(err.message || "Non è stato possibile salvare il profilo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLabel = pet ? "Salva modifiche" : "Aggiungi animale";

  return (
    <FormModal
      show={show}
      onHide={handleClose}
      onSubmit={handleSubmit}
      title={pet ? "Modifica profilo" : "Aggiungi un animale"}
      size="lg"
      closeButton={!isSubmitting}
      backdrop={isSubmitting ? "static" : true}
      keyboard={!isSubmitting}
      footer={
        <>
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
            ) : (
              submitLabel
            )}
          </Button>
        </>
      }
    >
      {error && (
        <Alert variant="danger" className="small">
          {error}
        </Alert>
      )}

      <div className="text-center mb-4">
        <Image
          src={avatar?.preview || pet?.cover || petPlaceholder}
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
            accept={AVATAR_TYPES.join(",")}
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

      <Field
        label="Nome *"
        id="petName"
        {...bind("name")}
        placeholder="Es. Achille"
        maxLength={80}
        required
        autoFocus
      />

      <Field
        label="Specie *"
        id="petSpecies"
        as={Form.Select}
        {...bind("species")}
        required
      >
        {options(SPECIES)}
      </Field>

      <Field
        label="Razza"
        id="petBreed"
        {...bind("breed")}
        placeholder="Es. Labrador"
        maxLength={100}
      />

      <Field
        label="Data di nascita"
        id="petBirthDate"
        type="date"
        {...bind("birthDate")}
        max={new Date().toISOString().slice(0, 10)}
      />

      <Field label="Sesso" id="petSex" as={Form.Select} {...bind("sex")}>
        {options(SEX)}
      </Field>

      <Field
        label="Numero microchip"
        id="petMicrochip"
        {...bind("microchipNumber")}
        placeholder="Facoltativo"
        maxLength={100}
      />

      <Form.Check
        type="checkbox"
        name="sterilized"
        id="petSterilized"
        label="Animale sterilizzato"
        checked={formData.sterilized}
        onChange={handleChange}
      />
    </FormModal>
  );
};

export default PetFormModal;
