import Pet from "../modules/pets/Pet.js";
import {
  getPetWithAccess,
  getAccessiblePetIds,
} from "../utils/petAccess.js";
import * as petService from "../services/petService.js";
import { cloudinary } from "../middlewares/cloudinary.js";

export const createPet = async (req, res, next) => {
  try {
    const {
      species,
      name,
      breed,
      cover,
      birthDate,
      sex,
      sterilized,
      microchipNumber,
    } = req.body;

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
      req.user._id,
    );

    res.status(201).json(await petService.petView(pet, req.user._id));
  } catch (error) {
    next(error);
  }
};

export const getPets = async (req, res, next) => {
  try {
    const petIds = await getAccessiblePetIds(req.user._id);

    const pets = await Pet.find({
      _id: { $in: petIds },
    });

    const result = await Promise.all(
      pets.map((pet) => petService.petView(pet, req.user._id)),
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPetById = async (req, res, next) => {
  try {
    const pet = await getPetWithAccess(
      req.params.petId,
      req.user._id,
      "viewer",
    );

    if (!pet) {
      return res.status(404).json({ message: "Animale non trovato" });
    }

    res.status(200).json(await petService.petView(pet, req.user._id));
  } catch (error) {
    next(error);
  }
};

export const updatePet = async (req, res, next) => {
  try {
    const pet = await getPetWithAccess(
      req.params.petId,
      req.user._id,
      "editor",
    );

    if (!pet) {
      return res.status(404).json({ message: "Animale non trovato" });
    }

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
      if (req.body[field] !== undefined) {
        pet[field] = req.body[field];
      }
    }

    const updatedPet = await pet.save();

    res.status(200).json(
      await petService.petView(updatedPet, req.user._id),
    );
  } catch (error) {
    next(error);
  }
};

export const deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.petId,
      owner: req.user._id,
    });

    if (!pet) {
      return res.status(404).json({ message: "Animale non trovato" });
    }

    await petService.deletePetCascade(pet);

    res.status(200).json({
      message: "Animale eliminato con successo",
    });
  } catch (error) {
    next(error);
  }
};

export const authorizePetEditor = async (req, res, next) => {
  try {
    const pet = await getPetWithAccess(
      req.params.petId,
      req.user._id,
      "editor",
    );

    if (!pet) {
      return res.status(404).json({
        message: "Animale non trovato",
      });
    }

    req.pet = pet;
    next();
  } catch (error) {
    next(error);
  }
};

export const updatePetAvatar = async (req, res, next) => {
  try {
    const pet = req.pet;

    if (!req.file) {
      return res.status(400).json({
        message: "Seleziona un'immagine da caricare",
      });
    }

    const oldPublicId = pet.coverPublicId;

    pet.cover = req.file.path;
    pet.coverPublicId = req.file.filename;

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

    return res.status(200).json(
      await petService.petView(pet, req.user._id),
    );
  } catch (error) {
    next(error);
  }
};
