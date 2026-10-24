import Pet from "../modules/pets/Pet.js";
import { randomBytes } from "node:crypto";

export const createPet = async (req, res, next) => {
  try {
    const { species, name, breed, cover } = req.body;

    const pet = new Pet({
      species,
      name,
      breed,
      cover,
      owner: req.user._id,
      qrToken: randomBytes(32).toString("hex"),
    });

    const savedPet = await pet.save();

    res.status(201).json(savedPet);
  } catch (e) {
    next(e);
  }
};

export const getPets = async (req, res, next) => {
  try {
    const pets = await Pet.find({ owner: req.user._id });

    res.status(200).json(pets);
  } catch (e) {
    next(e);
  }
};

export const getPetById = async (req, res, next) => {
  try {
    const { petId } = req.params;

    const pet = await Pet.findOne({
      _id: petId,
      owner: req.user._id,
    });

    if (!pet) {
      return res.status(404).json({
        message: "Animale non trovato",
      });
    }

    res.status(200).json(pet);
  } catch (e) {
    next(e);
  }
};

export const updatePet = async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { species, name, breed, cover } = req.body;

    const pet = await Pet.findOne({
      _id: petId,
      owner: req.user._id,
    });

    if (!pet) {
      return res.status(404).json({
        message: "Animale non trovato",
      });
    }

    if (species !== undefined) pet.species = species;
    if (name !== undefined) pet.name = name;
    if (breed !== undefined) pet.breed = breed;
    if (cover !== undefined) pet.cover = cover;

    const updatedPet = await pet.save();

    res.status(200).json(updatedPet);
  } catch (e) {
    next(e);
  }
};

export const deletePet = async (req, res, next) => {
  try {
    const { petId } = req.params;

    const pet = await Pet.findOneAndDelete({
      _id: petId,
      owner: req.user._id,
    });

    if (!pet) {
      return res.status(404).json({
        message: "Animale non trovato",
      });
    }

    res.status(200).json({
      message: "Animale eliminato con successo",
    });
  } catch (e) {
    next(e);
  }
};
