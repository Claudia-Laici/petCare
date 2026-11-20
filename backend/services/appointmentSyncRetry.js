import Appointment from "../modules/appointments/schema.js";
import {
  syncAppointmentWithGoogle,
  deleteAppointmentEverywhere,
} from "./appointmentGoogleSync.js";

const RETRY_AFTER_MS = 2 * 60 * 1000;
const BATCH_SIZE = 100;

export const retryAppointmentSync = async () => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - RETRY_AFTER_MS);

  const candidates = await Appointment.find({
    googleSyncStatus: { $in: ["error", "pending"] },
    $or: [
      { lastSyncAttemptAt: null },
      { lastSyncAttemptAt: { $lte: cutoff } },
    ],
  })
    .sort({ lastSyncAttemptAt: 1 })
    .limit(BATCH_SIZE);

  const results = {
    processed: 0,
    synced: 0,
    deleted: 0,
    failed: 0,
    skipped: 0,
  };

  if (!candidates.length) {
    console.info("[Google Calendar] Nessun appuntamento da recuperare.");
    return results;
  }

  console.info(
    `[Google Calendar] Avvio retry: ${candidates.length} appuntamenti trovati.`,
  );

  for (const appointment of candidates) {
    try {
      if (appointment.deletedAt) {
        const deleted = await deleteAppointmentEverywhere(appointment);

        if (deleted) {
          results.deleted++;
          results.processed++;
        } else {
          results.skipped++;
        }

        continue;
      }

      const syncedAppointment =
        await syncAppointmentWithGoogle(appointment);

      results.processed++;

      if (syncedAppointment?.googleSyncStatus === "synced") {
        results.synced++;
      } else if (
        syncedAppointment?.googleSyncStatus === "not_connected"
      ) {
        results.skipped++;
      } else if (syncedAppointment) {
        results.failed++;
      } else {
        results.skipped++;
      }
    } catch (error) {
      console.error(
        `[Google Calendar] Errore retry appuntamento ${appointment._id}:`,
        error,
      );

      await Appointment.findOneAndUpdate(
        { _id: appointment._id },
        {
          $set: {
            googleSyncStatus: "error",
            googleSyncError: String(
              error?.message || error,
            ).slice(0, 500),
            lastSyncAttemptAt: new Date(),
          },
        },
      );

      results.failed++;
      results.processed++;
    }
  }

  console.info("[Google Calendar] Retry completato:", results);

  return results;
};

export const retryUserFutureAppointments = async (userId) => {
  const appointments = await Appointment.find({
    createdBy: userId,
    deletedAt: null,
    startAt: { $gte: new Date() },
    googleSyncStatus: "pending",
  }).sort({ startAt: 1 });

  const results = {
    total: appointments.length,
    synced: 0,
    failed: 0,
    skipped: 0,
  };

  for (const appointment of appointments) {
    try {
      const syncedAppointment =
        await syncAppointmentWithGoogle(appointment);

      if (syncedAppointment?.googleSyncStatus === "synced") {
        results.synced++;
      } else if (syncedAppointment?.googleSyncStatus === "error") {
        results.failed++;
      } else {
        results.skipped++;
      }
    } catch (error) {
      console.error(
        `[Google Calendar] Errore sincronizzazione appuntamento ${appointment._id}:`,
        error,
      );

      results.failed++;
    }
  }

  return results;
};