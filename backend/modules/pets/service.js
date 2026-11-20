import Pet from "./schema.js";
import {
  getPetWithAccess,
  getAccessiblePetIds,
} from "../../utils/petAccess.js";
import * as petService from "../../services/petService.js";
import { cloudinary } from "../../middlewares/globals/cloudinary.js";

export const createPet = async (data, userId) => {
  const {
    species,
    name,
    breed,
    cover,
    birthDate,
    sex,
    sterilized,
    microchipNumber,
  } = data;

  const pet = await petService.createPetWithHealthCard(
    {
      species,
      name,
      breed,
      cover,
      birthDate,
      sex,
      sterilized,
      microchipNumber,
    },
    userId,
  );

  return petService.petView(pet, userId);
};

export const getPets = async (userId) => {
  const petIds = await getAccessiblePetIds(userId);

  const pets = await Pet.find({
    _id: { $in: petIds },
  });

  return Promise.all(
    pets.map((pet) => petService.petView(pet, userId)),
  );
};

export const getPetById = async (petId, userId) => {
  const pet = await getPetWithAccess(petId, userId, "viewer");

  if (!pet) return null;

  return petService.petView(pet, userId);
};

export const updatePet = async (petId, userId, data) => {
  const pet = await getPetWithAccess(petId, userId, "editor");

  if (!pet) return null;

  const allowed = [
    "species",
    "name",
    "breed",
    "cover",
    "birthDate",
    "sex",
    "sterilized",
    "microchipNumber",
  ];

  for (const field of allowed) {
    if (data[field] !== undefined) {
      pet[field] = data[field];
    }
  }

  const updatedPet = await pet.save();

  return petService.petView(updatedPet, userId);
};

export const deletePet = async (petId, userId) => {
  const pet = await Pet.findOne({
    _id: petId,
    owner: userId,
  });

  if (!pet) return false;

  await petService.deletePetCascade(pet);

  return true;
};

export const getPetForEditor = async (petId, userId) => {
  return getPetWithAccess(petId, userId, "editor");
};

export const updatePetAvatar = async (pet, file, userId) => {
  if (!file) {
    return {
      statusCode: 400,
      data: { message: "Seleziona un'immagine da caricare" },
    };
  }

  const oldPublicId = pet.coverPublicId;

  pet.cover = file.path;
  pet.coverPublicId = file.filename;

  await pet.save();

  if (oldPublicId && oldPublicId !== pet.coverPublicId) {
    try {
      await cloudinary.uploader.destroy(oldPublicId, {
        resource_type: "image",
      });
    } catch (error) {
      console.error(
        "Impossibile eliminare la vecchia immagine:",
        error,
      );
    }
  }

  return {
    statusCode: 200,
    data: await petService.petView(pet, userId),
  };
};