import * as appointmentService from "./service.js";

const NOT_FOUND = { message: "Appuntamento non trovato" };

export const createAppointment = async (req, res, next) => {
  try {
    const result = await appointmentService.createAppointment(
      req.body,
      req.user._id,
      req.get("Idempotency-Key"),
    );

    res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    const appointments = await appointmentService.getAppointments(
      req.user._id,
      req.query,
    );

    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await appointmentService.getAppointmentById(
      req.params.appointmentId,
      req.user._id,
    );

    if (!appointment) {
      return res.status(404).json(NOT_FOUND);
    }

    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const updated = await appointmentService.updateAppointment(
      req.params.appointmentId,
      req.user._id,
      req.body,
    );

    if (!updated) {
      return res.status(404).json(NOT_FOUND);
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    const result = await appointmentService.deleteAppointment(
      req.params.appointmentId,
      req.user._id,
    );

    if (!result) {
      return res.status(404).json(NOT_FOUND);
    }

    if (result.success) {
      return res.status(200).json({
        message: result.message,
      });
    }

    return res.status(200).json({
      message: result.message,
      googleSyncStatus: result.googleSyncStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const addParticipant = async (req, res, next) => {
  try {
    const result = await appointmentService.addParticipant(
      req.params.appointmentId,
      req.user._id,
      req.body,
    );

    res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const updateParticipantNote = async (req, res, next) => {
  try {
    const result = await appointmentService.updateParticipantNote(
      req.params.appointmentId,
      req.user._id,
      req.params.userId,
      req.body.note,
    );

    res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const removeParticipant = async (req, res, next) => {
  try {
    const result = await appointmentService.removeParticipant(
      req.params.appointmentId,
      req.user._id,
      req.params.userId,
    );

    res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};
