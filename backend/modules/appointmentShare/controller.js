import * as appointmentShareService from "./service.js";

export const createAppointmentShare = async (req, res, next) => {
  try {
    const result = await appointmentShareService.createAppointmentShare(
      req.params.appointmentId,
      req.user._id,
      req.body,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentShares = async (req, res, next) => {
  try {
    const result = await appointmentShareService.getAppointmentShares(
      req.params.appointmentId,
      req.user._id,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const revokeAppointmentShare = async (req, res, next) => {
  try {
    const result = await appointmentShareService.revokeAppointmentShare(
      req.params.appointmentId,
      req.params.shareId,
      req.user._id,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const getPublicAppointment = async (req, res, next) => {
  try {
    const result = await appointmentShareService.getPublicAppointment(
      req.params.token,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};
