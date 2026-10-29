import crypto from "crypto";
import Pet from "../models/Pet.js";
import HealthCard from "../models/HealthCard.js";
import PetQr from "../models/PetQr.js";
import PetShare from "../models/PetShare.js";

export async function createPet(petData, ownerId, healthData = {}) {
  const pet = await Pet.create({ ...petData, owner: ownerId });
  const healthCard = await HealthCard.create({ ...healthData, pet: pet._id });
  pet.healthCard = healthCard._id;
  return pet.save();
}

export async function deletePet(petId) {
  const pet = await Pet.findByIdAndDelete(petId);
  if (!pet) return null;
  await Promise.all([
    HealthCard.deleteOne({ pet: pet._id }),
    PetQr.deleteOne({ pet: pet._id }),
    PetShare.deleteMany({ pet: pet._id }),
  ]);
  return pet;
}

export async function enableQr(pet) {
  const qr = await PetQr.findOneAndUpdate(
    { pet: pet._id },
    { token: crypto.randomBytes(24).toString("hex") },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
  if (!pet.qr) {
    pet.qr = qr._id;
    await pet.save();
  }
  return qr;
}

export async function disableQr(pet) {
  await PetQr.deleteOne({ pet: pet._id });
  pet.qr = null;
  await pet.save();
}

export async function sharePet(pet, userId, role = "viewer", expiresAt = null) {
  const share = await PetShare.findOneAndUpdate(
    { pet: pet._id, user: userId },
    { role, expiresAt },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
  await Pet.updateOne({ _id: pet._id }, { $addToSet: { sharedWith: share._id } });
  return share;
}

export async function unsharePet(pet, userId) {
  const share = await PetShare.findOneAndDelete({ pet: pet._id, user: userId });
  if (share) await Pet.updateOne({ _id: pet._id }, { $pull: { sharedWith: share._id } });
}

export async function getPetRole(pet, userId) {
  const ownerId = pet.owner._id ?? pet.owner;
  if (String(ownerId) === String(userId)) return "owner";

  const share = await PetShare.findOne({
    pet: pet._id,
    user: userId,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  });
  return share ? share.role : null;
}

export function toJSONFor(pet, role) {
  const { qr, sharedWith, coverPublicId, __v, ...view } = pet.toObject();
  return role === "owner" ? { ...view, qr, sharedWith } : view;
}

export function toPublicJSON(pet) {
  const hc = pet.healthCard;
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    cover: pet.cover,
    microchipNumber: pet.microchipNumber,
    allergies: hc?.allergies ?? [],
    medicalConditions: hc?.medicalConditions ?? [],
    emergencyNotes: hc?.emergencyNotes ?? "",
    publicPhone: hc?.publicPhone ?? "",
  };
}