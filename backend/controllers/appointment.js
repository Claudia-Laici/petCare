import { createHash } from "node:crypto";
import Appointment from "../modules/appointments/Appointment.js";
import User from "../modules/users/User.js";
import { getPetWithAccess, getPetIdsForQuery } from "../utils/petAccess.js";
import {
  syncAppointmentWithGoogle,
  deleteAppointmentEverywhere,
} from "../services/appointmentGoogleSync.js";

const NOT_FOUND = { message: "Appuntamento non trovato" };

const PARTICIPANT_FIELDS = "nome cognome email";

const createAppointmentHash = (data) =>
  createHash("sha256").update(JSON.stringify(data)).digest("hex");

const findAppointment = async (appointmentId, userId, role) => {
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

export const createAppointment = async (req, res, next) => {
  try {
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
    } = req.body;

    const idempotencyKey = req.get("Idempotency-Key")?.trim();

    if (!idempotencyKey || idempotencyKey.length > 128) {
      return res.status(400).json({
        message: "Header Idempotency-Key mancante o non valido",
      });
    }

    const existingPet = await getPetWithAccess(pet, req.user._id, "editor");

    if (!existingPet) {
      return res.status(404).json({
        message: "Animale non trovato",
      });
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
      createdBy: req.user._id,
      idempotencyKey,
    });

    if (existingAppointment) {
      if (existingAppointment.idempotencyHash !== idempotencyHash) {
        return res.status(409).json({
          message: "Questa chiave è già stata utilizzata con dati differenti",
        });
      }

      return res.status(200).json(existingAppointment);
    }

    let saved;

    try {
      saved = await new Appointment({
        ...appointmentData,
        createdBy: req.user._id,
        idempotencyKey,
        idempotencyHash,
      }).save();
    } catch (error) {
      if (error.code !== 11000) throw error;
      const duplicate = await Appointment.findOne({
        createdBy: req.user._id,
        idempotencyKey,
      });

      if (!duplicate) throw error;

      if (duplicate.idempotencyHash !== idempotencyHash) {
        return res.status(409).json({
          message: "Questa chiave è già stata utilizzata con dati differenti",
        });
      }

      return res.status(200).json(duplicate);
    }

    const synced = await syncAppointmentWithGoogle(saved);

    return res.status(201).json(synced ?? saved);
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    const petIds = await getPetIdsForQuery(req.user._id, req.query.pet);

    const sharedWithMe = { "participants.user": req.user._id };
    if (req.query.pet) sharedWithMe.pet = req.query.pet;

    const filter = {
      deletedAt: null,
      $or: [{ pet: { $in: petIds } }, sharedWithMe],
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const appointments = await Appointment.find(filter)
      .sort({ startAt: 1 })
      .populate("participants.user", PARTICIPANT_FIELDS);

    res.status(200).json(appointments);
  } catch (e) {
    next(e);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await findAppointment(
      req.params.appointmentId,
      req.user._id,
      "viewer",
    );

    if (!appointment) return res.status(404).json(NOT_FOUND);

    await appointment.populate("participants.user", PARTICIPANT_FIELDS);

    res.status(200).json(appointment);
  } catch (e) {
    next(e);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await findAppointment(
      req.params.appointmentId,
      req.user._id,
      "editor",
    );

    if (!appointment) return res.status(404).json(NOT_FOUND);

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
      if (req.body[field] !== undefined) {
        appointment[field] = req.body[field];
      }
    });

    appointment.googleSyncStatus = "pending";
    appointment.googleSyncError = "";

    const updated = await appointment.save();
    const synced = await syncAppointmentWithGoogle(updated);

    res.status(200).json(synced ?? updated);
  } catch (e) {
    next(e);
  }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await findAppointment(
      req.params.appointmentId,
      req.user._id,
      "editor",
    );

    if (!appointment) return res.status(404).json(NOT_FOUND);

    const deleted = await deleteAppointmentEverywhere(appointment);

    if (deleted) {
      return res
        .status(200)
        .json({ message: "Appuntamento eliminato con successo" });
    }

    return res.status(200).json({
      message:
        "Appuntamento rimosso dalla visualizzazione, ma la cancellazione su Google è ancora da completare.",
      googleSyncStatus: "error",
    });
  } catch (e) {
    next(e);
  }
};

export const addParticipant = async (req, res, next) => {
  try {
    const appointment = await findAppointment(
      req.params.appointmentId,
      req.user._id,
      "editor",
    );

    if (!appointment) return res.status(404).json(NOT_FOUND);

    const { email, note = "" } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Email obbligatoria" });
    }

    const invited = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("_id");

    if (!invited) {
      return res
        .status(404)
        .json({ message: "Nessun utente PetCare con questa email" });
    }

    const alreadyIn =
      invited._id.equals(appointment.createdBy) ||
      appointment.participants.some((p) => p.user.equals(invited._id));

    if (alreadyIn) {
      return res
        .status(409)
        .json({ message: "Questa persona partecipa già all'appuntamento" });
    }

    appointment.participants.push({ user: invited._id, note });
    await appointment.save();
    await appointment.populate("participants.user", PARTICIPANT_FIELDS);

    res.status(201).json(appointment);
  } catch (e) {
    next(e);
  }
};

export const updateParticipantNote = async (req, res, next) => {
  try {
    const appointment = await findAppointment(
      req.params.appointmentId,
      req.user._id,
      "editor",
    );

    if (!appointment) return res.status(404).json(NOT_FOUND);

    const participant = appointment.participants.find(
      (p) => p.user.toString() === req.params.userId,
    );

    if (!participant) {
      return res.status(404).json({ message: "Partecipante non trovato" });
    }

    if (typeof req.body.note !== "string") {
      return res.status(400).json({ message: "Nota non valida" });
    }

    participant.note = req.body.note;
    await appointment.save();
    await appointment.populate("participants.user", PARTICIPANT_FIELDS);

    res.status(200).json(appointment);
  } catch (e) {
    next(e);
  }
};

export const removeParticipant = async (req, res, next) => {
  try {
    const { appointmentId, userId } = req.params;
    const isSelf = userId === req.user._id.toString();

    const appointment = await findAppointment(
      appointmentId,
      req.user._id,
      isSelf ? "viewer" : "editor",
    );

    if (!appointment) return res.status(404).json(NOT_FOUND);

    const before = appointment.participants.length;
    appointment.participants = appointment.participants.filter(
      (p) => p.user.toString() !== userId,
    );

    if (appointment.participants.length === before) {
      return res.status(404).json({ message: "Partecipante non trovato" });
    }

    await appointment.save();

    res.status(200).json({ message: "Partecipante rimosso" });
  } catch (e) {
    next(e);
  }
};
