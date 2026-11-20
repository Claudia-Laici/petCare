import mongoose from "mongoose";
import { randomBytes, createHash } from "node:crypto";
import Appointment from "../appointments/schema.js";
import AppointmentShare from "./schema.js";
import { getPetWithAccess } from "../../utils/petAccess.js";

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

export const generateShareToken = () => {
  const token = randomBytes(32).toString("hex");

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  return { token, tokenHash };
};

export const findValidShare = async (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  const share = await AppointmentShare.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).select("+tokenHash");

  return share;
};

export const createAppointmentShare = async (
  appointmentId,
  userId,
  data,
) => {
  const { expiresInDays = 7, share } = data;

  if (!mongoose.isValidObjectId(appointmentId)) {
    return {
      statusCode: 404,
      data: NOT_FOUND,
    };
  }

  if (
    !Number.isInteger(expiresInDays) ||
    expiresInDays < 1 ||
    expiresInDays > 30
  ) {
    return {
      statusCode: 400,
      data: {
        message: "La scadenza deve essere compresa tra 1 e 30 giorni",
      },
    };
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
    return {
      statusCode: 400,
      data: {
        message: "Permessi di condivisione non validi",
      },
    };
  }

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    deletedAt: null,
  });

  if (!appointment) {
    return {
      statusCode: 404,
      data: NOT_FOUND,
    };
  }

  const pet = await getPetWithAccess(appointment.pet, userId, "editor");

  if (!pet) {
    return {
      statusCode: 404,
      data: NOT_FOUND,
    };
  }

  const { token, tokenHash } = generateShareToken();

  const expiresAt = new Date(
    Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
  );

  const appointmentShare = await AppointmentShare.create({
    appointment: appointment._id,
    createdBy: userId,
    tokenHash,
    expiresAt,
    share,
  });

  return {
    statusCode: 201,
    data: {
      message: "Link di condivisione creato con successo",
      share: {
        id: appointmentShare._id,
        token,
        expiresAt: appointmentShare.expiresAt,
        permissions: appointmentShare.share,
      },
    },
  };
};

export const getAppointmentShares= async (
  appointmentId,
  userId,
) => {
  if (!mongoose.isValidObjectId(appointmentId)) {
    return {
      statusCode: 404,
      data: NOT_FOUND,
    };
  }

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    deletedAt: null,
  });

  if (!appointment) {
    return {
      statusCode: 404,
      data: NOT_FOUND,
    };
  }

  const pet = await getPetWithAccess(appointment.pet, userId, "editor");

  if (!pet) {
    return {
      statusCode: 404,
      data: NOT_FOUND,
    };
  }

  const shares = await AppointmentShare.find({
    appointment: appointment._id,
  })
    .select("-tokenHash")
    .sort({ createdAt: -1 });

  return {
    statusCode: 200,
    data: shares,
  };
};

export const revokeAppointmentShare = async (
  appointmentId,
  shareId,
  userId,
) => {
  if (
    !mongoose.isValidObjectId(appointmentId) ||
    !mongoose.isValidObjectId(shareId)
  ) {
    return {
      statusCode: 404,
      data: NOT_FOUND,
    };
  }

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    deletedAt: null,
  });

  if (!appointment) {
    return {
      statusCode: 404,
      data: NOT_FOUND,
    };
  }

  const pet = await getPetWithAccess(appointment.pet, userId, "editor");

  if (!pet) {
    return {
      statusCode: 404,
      data: NOT_FOUND,
    };
  }

  const share = await AppointmentShare.findOne({
    _id: shareId,
    appointment: appointment._id,
    revokedAt: null,
  });

  if (!share) {
    return {
      statusCode: 404,
      data: {
        message: "Link di condivisione non trovato",
      },
    };
  }

  share.revokedAt = new Date();
  await share.save();

  return {
    statusCode: 200,
    data: {
      message: "Link di condivisione revocato con successo",
    },
  };
};

export const getPublicAppointment = async (token) => {
  const share = await findValidShare(token);

  if (!share) {
    return {
      statusCode: 404,
      data: {
        message: "Link di condivisione non valido o scaduto",
      },
    };
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
    return {
      statusCode: 404,
      data: {
        message: "Appuntamento non trovato",
      },
    };
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
    publicAppointment.attendeeInstructions =
      appointment.attendeeInstructions;
  }

  return {
    statusCode: 200,
    data: publicAppointment,
  };
};