import * as healthCardService from "./service.js";

export const getHealthCard = async (req, res, next) => {
  try {
    const card = await healthCardService.getHealthCard(
      req.params.petId,
      req.user._id,
    );

    if (!card) {
      return res.status(404).json({
        message: "Animale non trovato",
      });
    }

    return res.status(200).json(card);
  } catch (error) {
    next(error);
  }
};

export const updateHealthCard = async (req, res, next) => {
  try {
    const updated = await healthCardService.updateHealthCard(
      req.params.petId,
      req.user._id,
      req.body,
    );

    if (!updated) {
      return res.status(404).json({
        message: "Animale non trovato",
      });
    }

    if (updated.statusCode) {
      return res.status(updated.statusCode).json(updated.data);
    }

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
