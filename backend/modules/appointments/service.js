import Appointment from "./schema.js";
import User from "../users/schema.js";
import { getPetWithAccess, getPetIdsForQuery } from "../../utils/petAccess.js";
import { createHash } from "node:crypto";
import {
  syncAppointmentWithGoogle,
  deleteAppointmentEverywhere,
} from "../../services/appointmentGoogleSync.js";

const PARTICIPANT_FIELDS = "nome cognome email";

const createAppointmentHash = (data) =>
  createHash("sha256").update(JSON.stringify(data)).digest("hex");

export const findAppointment = async (appointmentId, userId, role) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    deletedAt: null,
  });

  if (!appointment) return null;

  const pet = await getPetWithAccess(appointment.pet, userId, role);
  if (pet) return appointment;

  const isParticipant = appointment.participants.some((p) =>
    p.user.equals(userId),
  );

  return role === "viewer" && isParticipant ? appointment : null;
};

export const createAppointment = async (
  data,
  userId,
  idempotencyKey,
) => {
  const {
    pet,
    title,
    type,
    startAt,
    endAt,
    location,
    veterinarian,
    notes,
    vetQuestions,
    attendeeInstructions,
    checklist,
  } = data;

  const key = idempotencyKey?.trim();

  if (!key || key.length > 128) {
    return {
      statusCode: 400,
      data: { message: "Header Idempotency-Key mancante o non valido" },
    };
  }

  const existingPet = await getPetWithAccess(pet, userId, "editor");

  if (!existingPet) {
    return {
      statusCode: 404,
      data: { message: "Animale non trovato" },
    };
  }

  const appointmentData = {
    pet,
    title,
    type: type ?? "visit",
    startAt,
    endAt: endAt ?? null,
    location: location ?? "",
    veterinarian: veterinarian ?? "",
    notes: notes ?? "",
    vetQuestions: vetQuestions ?? "",
    attendeeInstructions: attendeeInstructions ?? "",
    checklist: checklist ?? [],
  };

  const idempotencyHash = createAppointmentHash(appointmentData);

  const existingAppointment = await Appointment.findOne({
    createdBy: userId,
    idempotencyKey: key,
  });

  if (existingAppointment) {
    if (existingAppointment.idempotencyHash !== idempotencyHash) {
      return {
        statusCode: 409,
        data: {
          message: "Questa chiave è già stata utilizzata con dati differenti",
        },
      };
    }

    return {
      statusCode: 200,
      data: existingAppointment,
    };
  }

  let saved;

  try {
    saved = await new Appointment({
      ...appointmentData,
      createdBy: userId,
      idempotencyKey: key,
      idempotencyHash,
    }).save();
  } catch (error) {
    if (error.code !== 11000) throw error;

    const duplicate = await Appointment.findOne({
      createdBy: userId,
      idempotencyKey: key,
    });

    if (!duplicate) throw error;

    if (duplicate.idempotencyHash !== idempotencyHash) {
      return {
        statusCode: 409,
        data: {
          message: "Questa chiave è già stata utilizzata con dati differenti",
        },
      };
    }

    return {
      statusCode: 200,
      data: duplicate,
    };
  }

  const synced = await syncAppointmentWithGoogle(saved);

  return {
    statusCode: 201,
    data: synced ?? saved,
  };
};

export const getAppointments = async (userId, filters) => {
  const petIds = await getPetIdsForQuery(userId, filters.pet);

  const sharedWithMe = { "participants.user": userId };

  if (filters.pet) {
    sharedWithMe.pet = filters.pet;
  }

  const filter = {
    deletedAt: null,
    $or: [{ pet: { $in: petIds } }, sharedWithMe],
  };

  if (filters.status) {
    filter.status = filters.status;
  }

  return Appointment.find(filter)
    .sort({ startAt: 1 })
    .populate("participants.user", PARTICIPANT_FIELDS);
};

export const getAppointmentById = async (appointmentId, userId) => {
  const appointment = await findAppointment(appointmentId, userId, "viewer");

  if (!appointment) return null;

  await appointment.populate("participants.user", PARTICIPANT_FIELDS);

  return appointment;
};

export const updateAppointment = async (appointmentId, userId, data) => {
  const appointment = await findAppointment(appointmentId, userId, "editor");

  if (!appointment) return null;

  const allowedFields = [
    "title",
    "type",
    "startAt",
    "endAt",
    "location",
    "veterinarian",
    "notes",
    "vetQuestions",
    "attendeeInstructions",
    "status",
    "checklist",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      appointment[field] = data[field];
    }
  });

  appointment.googleSyncStatus = "pending";
  appointment.googleSyncError = "";

  const updated = await appointment.save();
  const synced = await syncAppointmentWithGoogle(updated);

  return synced ?? updated;
};

export const deleteAppointment = async (appointmentId, userId) => {
  const appointment = await findAppointment(appointmentId, userId, "editor");

  if (!appointment) return null;

  const deleted = await deleteAppointmentEverywhere(appointment);

  if (deleted) {
    return {
      success: true,
      message: "Appuntamento eliminato con successo",
    };
  }

  return {
    success: false,
    message:
      "Appuntamento rimosso dalla visualizzazione, ma la cancellazione su Google è ancora da completare.",
    googleSyncStatus: "error",
  };
};


export const addParticipant = async (
  appointmentId,
  userId,
  data,
) => {
  const appointment = await findAppointment(
    appointmentId,
    userId,
    "editor",
  );

  if (!appointment) {
    return {
      statusCode: 404,
      data: { message: "Appuntamento non trovato" },
    };
  }

  const { email, note = "" } = data;

  if (typeof email !== "string" || !email.trim()) {
    return {
      statusCode: 400,
      data: { message: "Email obbligatoria" },
    };
  }

  const invited = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select("_id");

  if (!invited) {
    return {
      statusCode: 404,
      data: { message: "Nessun utente PetCare con questa email" },
    };
  }

  const alreadyIn =
    invited._id.equals(appointment.createdBy) ||
    appointment.participants.some((p) => p.user.equals(invited._id));

  if (alreadyIn) {
    return {
      statusCode: 409,
      data: {
        message: "Questa persona partecipa già all'appuntamento",
      },
    };
  }

  appointment.participants.push({ user: invited._id, note });

  await appointment.save();
  await appointment.populate("participants.user", PARTICIPANT_FIELDS);

  return {
    statusCode: 201,
    data: appointment,
  };
};

export const updateParticipantNote = async (
  appointmentId,
  userId,
  participantUserId,
  note,
) => {
  const appointment = await findAppointment(
    appointmentId,
    userId,
    "editor",
  );

  if (!appointment) {
    return {
      statusCode: 404,
      data: { message: "Appuntamento non trovato" },
    };
  }

  const participant = appointment.participants.find(
    (p) => p.user.toString() === participantUserId,
  );

  if (!participant) {
    return {
      statusCode: 404,
      data: { message: "Partecipante non trovato" },
    };
  }

  if (typeof note !== "string") {
    return {
      statusCode: 400,
      data: { message: "Nota non valida" },
    };
  }

  participant.note = note;

  await appointment.save();
  await appointment.populate("participants.user", PARTICIPANT_FIELDS);

  return {
    statusCode: 200,
    data: appointment,
  };
};

export const removeParticipant = async (
  appointmentId,
  userId,
  participantUserId,
) => {
  const isSelf = participantUserId === userId.toString();

  const appointment = await findAppointment(
    appointmentId,
    userId,
    isSelf ? "viewer" : "editor",
  );

  if (!appointment) {
    return {
      statusCode: 404,
      data: { message: "Appuntamento non trovato" },
    };
  }

  const before = appointment.participants.length;

  appointment.participants = appointment.participants.filter(
    (p) => p.user.toString() !== participantUserId,
  );

  if (appointment.participants.length === before) {
    return {
      statusCode: 404,
      data: { message: "Partecipante non trovato" },
    };
  }

  await appointment.save();

  return {
    statusCode: 200,
    data: { message: "Partecipante rimosso" },
  };
};
