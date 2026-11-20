import Vaccination from "./schema.js";
import { getPetWithAccess, getPetIdsForQuery } from "../../utils/petAccess.js";

export const createVaccination = async (data, userId) => {
  const {
    pet,
    name,
    dateAdministered,
    nextDueDate,
    isSingleDose,
    veterinarian,
    notes,
  } = data;

  const existingPet = await getPetWithAccess(pet, userId, "editor");

  if (!existingPet) return null;

  const vaccination = new Vaccination({
    pet,
    name,
    dateAdministered,
    nextDueDate,
    isSingleDose,
    veterinarian,
    notes,
  });

  return vaccination.save();
};

export const getVaccinations = async (userId, petFilter, status) => {
  const petIds = await getPetIdsForQuery(userId, petFilter);

  const filter = { pet: { $in: petIds } };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const limitDate = new Date(today);
  limitDate.setDate(limitDate.getDate() + 30);

  if (status === "upcoming") {
    filter.nextDueDate = {
      $gte: today,
      $lte: limitDate,
    };
  } else if (status === "overdue") {
    filter.nextDueDate = {
      $ne: null,
      $lt: today,
    };
  }

  return Vaccination.find(filter).sort({
    dateAdministered: -1,
  });
};

export const getVaccinationById = async (vaccinationId, userId) => {
  const vaccination = await Vaccination.findById(vaccinationId);

  if (!vaccination) return null;

  const pet = await getPetWithAccess(vaccination.pet, userId, "viewer");

  if (!pet) return null;

  return vaccination;
};

export const updateVaccination = async (vaccinationId, userId, data) => {
  const vaccination = await Vaccination.findById(vaccinationId);

  if (!vaccination) return null;

  const pet = await getPetWithAccess(vaccination.pet, userId, "editor");

  if (!pet) return null;

  const {
    name,
    dateAdministered,
    nextDueDate,
    isSingleDose,
    veterinarian,
    notes,
  } = data;

  if (name !== undefined) vaccination.name = name;

  if (dateAdministered !== undefined) {
    vaccination.dateAdministered = dateAdministered;
  }

  if (nextDueDate !== undefined) vaccination.nextDueDate = nextDueDate;

  if (veterinarian !== undefined) vaccination.veterinarian = veterinarian;

  if (isSingleDose !== undefined) vaccination.isSingleDose = isSingleDose;

  if (notes !== undefined) vaccination.notes = notes;

  return vaccination.save();
};

export const deleteVaccination = async (vaccinationId, userId) => {
  const vaccination = await Vaccination.findById(vaccinationId);

  if (!vaccination) return false;

  const pet = await getPetWithAccess(vaccination.pet, userId, "owner");

  if (!pet) return false;

  await vaccination.deleteOne();

  return true;
};
