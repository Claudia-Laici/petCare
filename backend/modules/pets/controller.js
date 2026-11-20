import * as petService from "./service.js";

export const createPet = async (req, res, next) => {
  try {
    const result = await petService.createPet(req.body, req.user._id);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPets = async (req, res, next) => {
  try {
    const result = await petService.getPets(req.user._id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPetById = async (req, res, next) => {
  try {
    const result = await petService.getPetById(
      req.params.petId,
      req.user._id,
    );

    if (!result) {
      return res.status(404).json({ message: "Animale non trovato" });
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updatePet = async (req, res, next) => {
  try {
    const result = await petService.updatePet(
      req.params.petId,
      req.user._id,
      req.body,
    );

    if (!result) {
      return res.status(404).json({ message: "Animale non trovato" });
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deletePet = async (req, res, next) => {
  try {
    const deleted = await petService.deletePet(
      req.params.petId,
      req.user._id,
    );

    if (!deleted) {
      return res.status(404).json({ message: "Animale non trovato" });
    }

    return res.status(200).json({
      message: "Animale eliminato con successo",
    });
  } catch (error) {
    next(error);
  }
};

export const authorizePetEditor = async (req, res, next) => {
  try {
    const pet = await petService.getPetForEditor(
      req.params.petId,
      req.user._id,
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
    const result = await petService.updatePetAvatar(
      req.pet,
      req.file,
      req.user._id,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};
