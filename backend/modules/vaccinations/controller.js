import * as vaccinationService from "./service.js";

export const createVaccination = async (req, res, next) => {
  try {
    const vaccination = await vaccinationService.createVaccination(
      req.body,
      req.user._id,
    );

    if (!vaccination) {
      return res.status(404).json({
        message: "Animale non trovato",
      });
    }

    res.status(201).json(vaccination);
  } catch (e) {
    next(e);
  }
};

export const getVaccinations = async (req, res, next) => {
  try {
    const vaccinations = await vaccinationService.getVaccinations(
      req.user._id,
      req.query.pet,
      req.query.status,
    );

    res.status(200).json(vaccinations);
  } catch (e) {
    next(e);
  }
};

export const getVaccinationById = async (req, res, next) => {
  try {
    const vaccination = await vaccinationService.getVaccinationById(
      req.params.vaccinationId,
      req.user._id,
    );

    if (!vaccination) {
      return res.status(404).json({
        message: "Vaccinazione non trovata",
      });
    }

    res.status(200).json(vaccination);
  } catch (e) {
    next(e);
  }
};

export const updateVaccination = async (req, res, next) => {
  try {
    const vaccination = await vaccinationService.updateVaccination(
      req.params.vaccinationId,
      req.user._id,
      req.body,
    );

    if (!vaccination) {
      return res.status(404).json({
        message: "Vaccinazione non trovata",
      });
    }

    res.status(200).json(vaccination);
  } catch (e) {
    next(e);
  }
};

export const deleteVaccination = async (req, res, next) => {
  try {
    const deleted = await vaccinationService.deleteVaccination(
      req.params.vaccinationId,
      req.user._id,
    );

    if (!deleted) {
      return res.status(404).json({
        message: "Vaccinazione non trovata",
      });
    }

    res.status(200).json({
      message: "Vaccinazione eliminata con successo",
    });
  } catch (e) {
    next(e);
  }
};