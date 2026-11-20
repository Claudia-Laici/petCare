import { getPetWithAccess } from "../../utils/petAccess.js";
import HealthCard from "./schema.js";
import * as petService from "../../services/petService.js";

export const getHealthCard = async (petId, userId) => {
  const pet = await getPetWithAccess(petId, userId, "viewer");

  if (!pet) return null;

  const card = await HealthCard.findOne({ pet: pet._id });

  return card ?? { allergies: [], medicalConditions: [] };
};

const validateStringArray = (value) => {
  if (!Array.isArray(value)) return null;

  const normalized = value.map((item) =>
    typeof item === "string" ? item.trim() : null,
  );

  if (normalized.some((item) => !item)) return null;

  return [
    ...new Map(normalized.map((item) => [item.toLowerCase(), item])).values(),
  ];
};

export const updateHealthCard = async (petId, userId, data) => {
  const pet = await getPetWithAccess(petId, userId, "editor");

  if (!pet) return null;

  const { allergies, medicalConditions, emergencyNotes, contactPhone } = data;

  let normalizedAllergies;
  let normalizedConditions;

  if (allergies !== undefined) {
    normalizedAllergies = validateStringArray(allergies);

    if (!normalizedAllergies) {
      return {
        statusCode: 400,
        data: { message: "Elenco allergie non valido" },
      };
    }
  }

  if (medicalConditions !== undefined) {
    normalizedConditions = validateStringArray(medicalConditions);

    if (!normalizedConditions) {
      return {
        statusCode: 400,
        data: { message: "Elenco condizioni mediche non valido" },
      };
    }
  }

  if (emergencyNotes !== undefined && typeof emergencyNotes !== "string") {
    return {
      statusCode: 400,
      data: { message: "Note di emergenza non valide" },
    };
  }

  if (contactPhone !== undefined && typeof contactPhone !== "string") {
    return {
      statusCode: 400,
      data: { message: "Numero di telefono non valido" },
    };
  }

  let healthCard = await HealthCard.findOne({ pet: pet._id });
  let isNew = false;

  if (!healthCard) {
    healthCard = new HealthCard({ pet: pet._id });
    isNew = true;
  }

  if (normalizedAllergies !== undefined) {
    healthCard.allergies = normalizedAllergies;
  }

  if (normalizedConditions !== undefined) {
    healthCard.medicalConditions = normalizedConditions;
  }

  if (emergencyNotes !== undefined) {
    healthCard.emergencyNotes = emergencyNotes.trim();
  }

  if (contactPhone !== undefined) {
    healthCard.contactPhone = contactPhone.trim();
  }

  await healthCard.save();

  if (isNew) {
    pet.healthCard = healthCard._id;
    await pet.save();
  }

  return petService.petView(pet, userId);
};
