import * as petQrService from "./service.js";

export const enableQr = async (req, res, next) => {
  try {
    const result = await petQrService.enableQr(
      req.params.petId,
      req.user._id,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const getQr = async (req, res, next) => {
  try {
    const result = await petQrService.getQr(
      req.params.petId,
      req.user._id,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const regenerateQr = async (req, res, next) => {
  try {
    const result = await petQrService.regenerateQr(
      req.params.petId,
      req.user._id,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const disableQr = async (req, res, next) => {
  try {
    const result = await petQrService.disableQr(
      req.params.petId,
      req.user._id,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const getPublicPet = async (req, res, next) => {
  try {
    const result = await petQrService.getPublicPet(req.params.qrToken);

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const updateQrSettings = async (req, res, next) => {
  try {
    const result = await petQrService.updateQrSettings(
      req.params.petId,
      req.user._id,
      req.body,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};
