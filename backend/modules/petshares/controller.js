import * as petShareService from "./service.js";

export const sharePet = async (req, res, next) => {
  try {
    const result = await petShareService.sharePet(
      req.params.petId,
      req.user._id,
      req.user.email,
      req.user.nome,
      req.body,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const unsharePet = async (req, res, next) => {
  try {
    const result = await petShareService.unsharePet(
      req.params.petId,
      req.user._id,
      req.params.userId,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const getPetShares = async (req, res, next) => {
  try {
    const result = await petShareService.getPetShares(
      req.params.petId,
      req.user._id,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const revokeInvitation = async (req, res, next) => {
  try {
    const result = await petShareService.revokeInvitation(
      req.params.petId,
      req.user._id,
      req.params.invitationId,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const updateShareRole = async (req, res, next) => {
  try {
    const result = await petShareService.updateShareRole(
      req.params.petId,
      req.user._id,
      req.params.userId,
      req.body.role,
      req.body.expiresAt,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};
