import { getPetWithAccess } from "../../utils/petAccess.js";
import HealthCard from "./schema.js";
import * as petService from "../../services/petService.js";

export const getHealthCard = async (petId, userId) => {
  const pet = await getPetWithAccess(petId, userId, "viewer");

  if (!pet) return null;

  const card = await HealthCard.findOne({ pet: pet._id });

  return card ?? { allergies: [], medicalConditions: [] };
};

export const updateHealthCard = async (petId, userId, data) => {
  const pet = await getPetWithAccess(petId, userId, "editor");

  if (!pet) return null;

  let healthCard = await HealthCard.findOne({ pet: pet._id });
  let isNew = false;

  if (!healthCard) {
    healthCard = new HealthCard({ pet: pet._id });
    isNew = true;
  }

  const {
    allergies,
    medicalConditions,
    emergencyNotes,
    contactPhone,
  } = data;

  if (allergies !== undefined) healthCard.allergies = allergies;

  if (medicalConditions !== undefined) {
    healthCard.medicalConditions = medicalConditions;
  }

  if (emergencyNotes !== undefined) {
    healthCard.emergencyNotes = emergencyNotes;
  }

  if (contactPhone !== undefined) {
    healthCard.contactPhone = contactPhone;
  }

  await healthCard.save();

  if (isNew) {
    pet.healthCard = healthCard._id;
    await pet.save();
  }

  return petService.petView(pet, userId);
};