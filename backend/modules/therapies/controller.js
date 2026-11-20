import * as therapyService from "./service.js";

export const createTherapy = async (req, res, next) => {
  try {
    const therapy = await therapyService.createTherapy(
      req.body,
      req.user._id,
    );

    if (!therapy) {
      return res.status(404).json({ message: "Animale non trovato" });
    }

    res.status(201).json(therapy);
  } catch (e) {
    next(e);
  }
};

export const getTherapies = async (req, res, next) => {
  try {
    const therapies = await therapyService.getTherapies(
      req.user._id,
      req.query.pet,
    );

    res.status(200).json(therapies);
  } catch (e) {
    next(e);
  }
};

export const getTherapyById = async (req, res, next) => {
  try {
    const therapy = await therapyService.getTherapyById(
      req.params.therapyId,
      req.user._id,
    );

    if (!therapy) {
      return res.status(404).json({ message: "Terapia non trovata" });
    }

    res.status(200).json(therapy);
  } catch (e) {
    next(e);
  }
};

export const updateTherapy = async (req, res, next) => {
  try {
    const therapy = await therapyService.updateTherapy(
      req.params.therapyId,
      req.user._id,
      req.body,
    );

    if (!therapy) {
      return res.status(404).json({ message: "Terapia non trovata" });
    }

    res.status(200).json(therapy);
  } catch (e) {
    next(e);
  }
};

export const deleteTherapy = async (req, res, next) => {
  try {
    const deleted = await therapyService.deleteTherapy(
      req.params.therapyId,
      req.user._id,
    );

    if (!deleted) {
      return res.status(404).json({ message: "Terapia non trovata" });
    }

    res.status(200).json({ message: "Terapia eliminata con successo" });
  } catch (e) {
    next(e);
  }
};