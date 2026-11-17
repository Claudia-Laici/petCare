import { randomUUID } from "node:crypto";
import Appointment from "../modules/appointments/Appointment.js";
import User from "../modules/users/User.js";
import {
  upsertGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from "./googleCalendarService.js";

const SYNC_LOCK_DURATION_MS = 5 * 60 * 1000;

const errorMessage = (error) =>
  String(error?.message || error).slice(0, 500);

const acquireSyncLock = async (appointmentId, includeDeleted = false) => {
  const token = randomUUID();
  const now = new Date();

  const filter = {
    _id: appointmentId,
    $or: [
      { syncLockUntil: null },
      { syncLockUntil: { $lte: now } },
    ],
  };

  if (!includeDeleted) {
    filter.deletedAt = null;
  }

  const appointment = await Appointment.findOneAndUpdate(
    filter,
    {
      $set: {
        syncLockToken: token,
        syncLockUntil: new Date(now.getTime() + SYNC_LOCK_DURATION_MS),
      },
    },
    {
      new: true,
      timestamps: false,
    },
  );

  return appointment ? { appointment, token } : null;
};

const releaseSyncLock = async (appointmentId, token) =>
  Appointment.findOneAndUpdate(
    {
      _id: appointmentId,
      syncLockToken: token,
    },
    {
      $set: {
        syncLockToken: null,
        syncLockUntil: null,
      },
    },
    {
      new: true,
      timestamps: false,
    },
  );

const setSyncState = (id, token, fields) =>
  Appointment.findOneAndUpdate(
    {
      _id: id,
      syncLockToken: token,
    },
    {
      $set: fields,
    },
    {
      new: true,
      timestamps: false,
    },
  );

const isAppointmentUnchanged = async (appointment) => {
  const current = await Appointment.findById(appointment._id)
    .select("updatedAt")
    .lean();

  return (
    current &&
    current.updatedAt.getTime() === appointment.updatedAt.getTime()
  );
};

export const syncAppointmentWithGoogle = async (appointment) => {
  const acquired = await acquireSyncLock(appointment._id);

  if (!acquired) {
    console.info(
      `[Google Calendar] Sincronizzazione già in corso: ${appointment._id}`,
    );

    return Appointment.findById(appointment._id);
  }

  const { appointment: currentAppointment, token } = acquired;
  const attemptedAt = new Date();

  try {
    const owner = await User.findById(currentAppointment.createdBy).select(
      "googleCalendar.connected googleCalendar.calendarId",
    );

    if (!owner?.googleCalendar?.connected) {
      return await setSyncState(currentAppointment._id, token, {
        googleSyncStatus: "not_connected",
        googleSyncError: "",
        lastSyncAttemptAt: attemptedAt,
      });
    }

    const calendarId =
      currentAppointment.googleCalendarId ||
      owner.googleCalendar.calendarId ||
      "primary";

    let googleEventId = currentAppointment.googleEventId;

    if (currentAppointment.status === "cancelled") {
      await deleteGoogleCalendarEvent(
        owner._id,
        currentAppointment,
        calendarId,
      );
    } else {
      const event = await upsertGoogleCalendarEvent(
        owner._id,
        currentAppointment,
        calendarId,
      );

      googleEventId = event.id;
    }

    const unchanged = await isAppointmentUnchanged(currentAppointment);

    if (!unchanged) {
      console.info(
        `[Google Calendar] Appuntamento modificato durante la sincronizzazione: ${currentAppointment._id}`,
      );

      return await setSyncState(currentAppointment._id, token, {
        googleSyncStatus: "pending",
        googleSyncError: "",
        lastSyncAttemptAt: attemptedAt,
      });
    }

    console.info(
      `[Google Calendar] Sincronizzazione completata: ${currentAppointment._id}`,
    );

    return await setSyncState(currentAppointment._id, token, {
      googleEventId,
      googleCalendarId: calendarId,
      googleSyncStatus: "synced",
      googleSyncError: "",
      lastSyncedAt: attemptedAt,
      lastSyncAttemptAt: attemptedAt,
    });
  } catch (error) {
    console.error(
      `[Google Calendar] Errore durante la sincronizzazione dell'appuntamento ${currentAppointment._id}:`,
      error,
    );

    const unchanged = await isAppointmentUnchanged(currentAppointment);

    return await setSyncState(currentAppointment._id, token, {
      googleSyncStatus: unchanged ? "error" : "pending",
      googleSyncError: unchanged ? errorMessage(error) : "",
      lastSyncAttemptAt: attemptedAt,
    });
  } finally {
    await releaseSyncLock(currentAppointment._id, token);
  }
};

export const deleteAppointmentEverywhere = async (appointment) => {
  const appointmentId = appointment._id;

  try {
    await Appointment.updateOne(
      {
        _id: appointmentId,
        deletedAt: null,
      },
      {
        $set: {
          deletedAt: new Date(),
          googleSyncStatus: "pending",
          googleSyncError: "",
        },
      },
    );

    const acquired = await acquireSyncLock(appointmentId, true);

    if (!acquired) {
      console.info(
        `[Google Calendar] Cancellazione in attesa di retry: ${appointmentId}`,
      );

      return false;
    }

    const { appointment: currentAppointment, token } = acquired;

    try {
      const owner = await User.findById(currentAppointment.createdBy).select(
        "googleCalendar.connected googleCalendar.calendarId",
      );

      if (owner?.googleCalendar?.connected) {
        const calendarId =
          currentAppointment.googleCalendarId ||
          owner.googleCalendar.calendarId ||
          "primary";

        await deleteGoogleCalendarEvent(
          owner._id,
          currentAppointment,
          calendarId,
        );
      }

      const deleted = await Appointment.findOneAndDelete({
        _id: appointmentId,
        syncLockToken: token,
      });

      if (!deleted) {
        console.info(
          `[Google Calendar] Lock non più disponibile durante la cancellazione: ${appointmentId}`,
        );

        return false;
      }

      console.info(
        `[Google Calendar] Appuntamento eliminato: ${appointmentId}`,
      );

      return true;
    } finally {
      await releaseSyncLock(appointmentId, token);
    }
  } catch (error) {
    console.error(
      `[Google Calendar] Errore durante la cancellazione dell'appuntamento ${appointmentId}:`,
      error,
    );

    await Appointment.findOneAndUpdate(
      { _id: appointmentId },
      {
        $set: {
          deletedAt: appointment.deletedAt || new Date(),
          googleSyncStatus: "error",
          googleSyncError: errorMessage(error),
          lastSyncAttemptAt: new Date(),
        },
      },
    );

    return false;
  }
};

export const queueFutureAppointmentsForSync = (userId) =>
  Appointment.updateMany(
    {
      createdBy: userId,
      deletedAt: null,
      startAt: { $gte: new Date() },
    },
    {
      $set: {
        googleSyncStatus: "pending",
        googleSyncError: "",
      },
    },
    {
      timestamps: false,
    },
  );