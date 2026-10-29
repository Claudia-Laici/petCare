import Vaccination from "../modules/vaccinations/Vaccination.js";
import Therapy from "../modules/therapies/Therapy.js";
import MedicalDocument from "../modules/medicalDocuments/MedicalDocument.js";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import Pet from "../modules/pets/Pet.js";
import HealthCard from "../modules/healthcards/HealthCard.js";
import PetQr from "../modules/petqrs/PetQr.js";
import PetShare from "../modules/petshares/PetShare.js";

export const deletePetCascade = async (pet) => {
  const documents = await MedicalDocument.find({ pet: pet._id });

  const filesToDelete = [
    ...documents
      .filter((doc) => doc.publicId)
      .map((doc) => ({
        publicId: doc.publicId,
        resourceType: doc.resourceType || "image",
      })),
    ...(pet.coverPublicId
      ? [{ publicId: pet.coverPublicId, resourceType: "image" }]
      : []),
  ];

  const results = await Promise.allSettled(
    filesToDelete.map(({ publicId, resourceType }) =>
      cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      }),
    ),
  );

  const failures = results.filter(
    (result) =>
      result.status === "rejected" ||
      !["ok", "not found"].includes(result.value?.result),
  );

  if (failures.length > 0) {
    console.error(
      "Errore eliminazione file Cloudinary:",
      failures,
    );

    throw new Error(
      "Impossibile eliminare tutti i file dell'animale da Cloudinary.",
    );
  }

  await Promise.all([
    MedicalDocument.deleteMany({ pet: pet._id }),
    Vaccination.deleteMany({ pet: pet._id }),
    Therapy.deleteMany({ pet: pet._id }),
    HealthCard.deleteOne({ pet: pet._id }),
    PetQr.deleteOne({ pet: pet._id }),
    PetShare.deleteMany({ pet: pet._id }),
  ]);

  await pet.deleteOne();
};

export const petPopulate = [
  { path: "healthCard" },
  { path: "qr" },
];

export async function createPetWithHealthCard(petData, ownerId) {
  const pet = await Pet.create({ ...petData, owner: ownerId });
  const healthCard = await HealthCard.create({ pet: pet._id });
  pet.healthCard = healthCard._id;
  return pet.save();
}

export async function enableQr(pet) {
  const qr = await PetQr.findOneAndUpdate(
    { pet: pet._id },
    { token: crypto.randomBytes(24).toString("hex") },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
  pet.qr = qr._id;
  await pet.save();
  return qr;
}

export async function disableQr(pet) {
  await PetQr.deleteOne({ pet: pet._id });
  pet.qr = null;
  await pet.save();
}

export async function grantAccess(pet, userId, role, expiresAt) {
  return PetShare.findOneAndUpdate(
    { pet: pet._id, user: userId },
    { role, expiresAt },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );
}

export async function revokeAccess(pet, userId) {
  return PetShare.findOneAndDelete({
    pet: pet._id,
    user: userId,
  });
}

export function toJSONFor(pet, userId) {
  const { qr, coverPublicId, __v, ...view } = pet.toObject();
  const isOwner = String(pet.owner._id ?? pet.owner) === String(userId);

  return isOwner ? { ...view, qr } : view;
}

export async function petView(pet, userId) {
  await pet.populate(petPopulate);

  const view = toJSONFor(pet, userId);
  const isOwner = String(pet.owner._id ?? pet.owner) === String(userId);

  if (isOwner) {
    view.sharedWith = await PetShare.find({ pet: pet._id })
      .populate("user", "nome cognome email")
      .lean();
  }

  return view;
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
    therapies: hc?.publicTherapies ?? [],
  };
}