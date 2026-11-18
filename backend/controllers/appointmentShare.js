import mongoose from "mongoose";
import Appointment from "../modules/appointments/Appointment.js";
import AppointmentShare from "../modules/appointmentShare/AppointmentShare.js";
import { getPetWithAccess } from "../utils/petAccess.js";
import {
  generateShareToken,
  findValidShare,
} from "../services/appointmentShareService.js";

const NOT_FOUND = { message: "Appuntamento non trovato" };

const SHARE_FIELDS = [
  "petName",
  "dateTime",
  "location",
  "veterinarian",
  "notes",
  "vetQuestions",
  "attendeeInstructions",
];

export const createAppointmentShare = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { expiresInDays = 7, share } = req.body;

    if (!mongoose.isValidObjectId(appointmentId)) {
      return res.status(404).json(NOT_FOUND);
    }

    if (
      !Number.isInteger(expiresInDays) ||
      expiresInDays < 1 ||
      expiresInDays > 30
    ) {
      return res.status(400).json({
        message: "La scadenza deve essere compresa tra 1 e 30 giorni",
      });
    }

    if (
      share !== undefined &&
      (typeof share !== "object" ||
        share === null ||
        Array.isArray(share) ||
        Object.entries(share).some(
          ([key, value]) =>
            !SHARE_FIELDS.includes(key) || typeof value !== "boolean",
        ))
    ) {
      return res.status(400).json({
        message: "Permessi di condivisione non validi",
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      deletedAt: null,
    });

    if (!appointment) {
      return res.status(404).json(NOT_FOUND);
    }

    const pet = await getPetWithAccess(appointment.pet, req.user._id, "editor");

    if (!pet) {
      return res.status(404).json(NOT_FOUND);
    }

    const { token, tokenHash } = generateShareToken();

    const expiresAt = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
    );

    const appointmentShare = await AppointmentShare.create({
      appointment: appointment._id,
      createdBy: req.user._id,
      tokenHash,
      expiresAt,
      share,
    });

    return res.status(201).json({
      message: "Link di condivisione creato con successo",
      share: {
        id: appointmentShare._id,
        token,
        expiresAt: appointmentShare.expiresAt,
        permissions: appointmentShare.share,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentShares = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    if (!mongoose.isValidObjectId(appointmentId)) {
      return res.status(404).json(NOT_FOUND);
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      deletedAt: null,
    });

    if (!appointment) {
      return res.status(404).json(NOT_FOUND);
    }

    const pet = await getPetWithAccess(appointment.pet, req.user._id, "editor");

    if (!pet) {
      return res.status(404).json(NOT_FOUND);
    }

    const shares = await AppointmentShare.find({
      appointment: appointment._id,
    })
      .select("-tokenHash")
      .sort({ createdAt: -1 });

    return res.status(200).json(shares);
  } catch (error) {
    next(error);
  }
};

export const revokeAppointmentShare = async (req, res, next) => {
  try {
    const { appointmentId, shareId } = req.params;

    if (
      !mongoose.isValidObjectId(appointmentId) ||
      !mongoose.isValidObjectId(shareId)
    ) {
      return res.status(404).json(NOT_FOUND);
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      deletedAt: null,
    });

    if (!appointment) {
      return res.status(404).json(NOT_FOUND);
    }

    const pet = await getPetWithAccess(appointment.pet, req.user._id, "editor");

    if (!pet) {
      return res.status(404).json(NOT_FOUND);
    }

    const share = await AppointmentShare.findOne({
      _id: shareId,
      appointment: appointment._id,
      revokedAt: null,
    });

    if (!share) {
      return res.status(404).json({
        message: "Link di condivisione non trovato",
      });
    }

    share.revokedAt = new Date();
    await share.save();

    return res.status(200).json({
      message: "Link di condivisione revocato con successo",
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicAppointment = async (req, res, next) => {
  try {
    const { token } = req.params;

    const share = await findValidShare(token);

    if (!share) {
      return res.status(404).json({
        message: "Link di condivisione non valido o scaduto",
      });
    }

    const appointment = await Appointment.findOne({
      _id: share.appointment,
      deletedAt: null,
    })
      .select(
        "pet startAt endAt location veterinarian notes vetQuestions attendeeInstructions",
      )
      .populate("pet", "name");

    if (!appointment) {
      return res.status(404).json({
        message: "Appuntamento non trovato",
      });
    }

    const permissions = share.share;

    const publicAppointment = {};

    if (permissions.petName) {
      publicAppointment.petName = appointment.pet?.name || "";
    }

    if (permissions.dateTime) {
      publicAppointment.startAt = appointment.startAt;
      publicAppointment.endAt = appointment.endAt;
    }

    if (permissions.location) {
      publicAppointment.location = appointment.location;
    }

    if (permissions.veterinarian) {
      publicAppointment.veterinarian = appointment.veterinarian;
    }

    if (permissions.notes) {
      publicAppointment.notes = appointment.notes;
    }

    if (permissions.vetQuestions) {
      publicAppointment.vetQuestions = appointment.vetQuestions;
    }

    if (permissions.attendeeInstructions) {
      publicAppointment.attendeeInstructions = appointment.attendeeInstructions;
    }

    return res.status(200).json(publicAppointment);
  } catch (error) {
    next(error);
  }
};
