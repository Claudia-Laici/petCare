import Therapy from "./schema.js";
import { getTherapyStatus } from "../../utils/therapyStatus.js";
import {
  getPetWithAccess,
  getPetIdsForQuery,
} from "../../utils/petAccess.js";

const withStatus = (therapy) => ({
  ...therapy.toObject(),
  status: getTherapyStatus(therapy),
});

export const createTherapy = async (data, userId) => {
  const {
    pet,
    name,
    dosage,
    frequency,
    startDate,
    endDate,
    nextReminderDate,
    veterinarian,
    notes,
  } = data;

  const existingPet = await getPetWithAccess(pet, userId, "editor");

  if (!existingPet) return null;

  const therapy = new Therapy({
    pet,
    name,
    dosage,
    frequency,
    startDate,
    endDate: endDate || null,
    nextReminderDate: nextReminderDate || null,
    veterinarian,
    notes,
  });

  const savedTherapy = await therapy.save();

  return withStatus(savedTherapy);
};

export const getTherapies = async (userId, petFilter) => {
  const petIds = await getPetIdsForQuery(userId, petFilter);

  const therapies = await Therapy.find({
    pet: { $in: petIds },
  }).sort({
    startDate: -1,
  });

  return therapies.map(withStatus);
};

export const getTherapyById = async (therapyId, userId) => {
  const therapy = await Therapy.findById(therapyId);

  if (!therapy) return null;

  const pet = await getPetWithAccess(therapy.pet, userId, "viewer");

  if (!pet) return null;

  return withStatus(therapy);
};

export const updateTherapy = async (therapyId, userId, data) => {
  const therapy = await Therapy.findById(therapyId);

  if (!therapy) return null;

  const pet = await getPetWithAccess(therapy.pet, userId, "editor");

  if (!pet) return null;

  const {
    name,
    dosage,
    frequency,
    startDate,
    endDate,
    nextReminderDate,
    veterinarian,
    notes,
  } = data;

  if (name !== undefined) therapy.name = name;
  if (dosage !== undefined) therapy.dosage = dosage;
  if (frequency !== undefined) therapy.frequency = frequency;
  if (startDate !== undefined) therapy.startDate = startDate;
  if (veterinarian !== undefined) therapy.veterinarian = veterinarian;
  if (notes !== undefined) therapy.notes = notes;
  if (endDate !== undefined) therapy.endDate = endDate || null;

  if (nextReminderDate !== undefined) {
    therapy.nextReminderDate = nextReminderDate || null;
  }

  const updatedTherapy = await therapy.save();

  return withStatus(updatedTherapy);
};

export const deleteTherapy = async (therapyId, userId) => {
  const therapy = await Therapy.findById(therapyId);

  if (!therapy) return false;

  const pet = await getPetWithAccess(therapy.pet, userId, "editor");

  if (!pet) return false;

  await therapy.deleteOne();

  return true;
};