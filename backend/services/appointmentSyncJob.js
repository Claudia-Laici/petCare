import cron from "node-cron";
import { retryAppointmentSync } from "./appointmentSyncRetry.js";

let running = false;

export const startAppointmentSyncJob = () => {
  console.info("[Google Calendar] Job di sincronizzazione avviato.");

  cron.schedule("*/5 * * * *", async () => {
    if (running) {
      console.info(
        "[Google Calendar] Job saltato: esecuzione precedente ancora in corso.",
      );
      return;
    }

    running = true;

    try {
      const results = await retryAppointmentSync();

      console.info(
        "[Google Calendar] Risultato job automatico:",
        results,
      );
    } catch (error) {
      console.error(
        "[Google Calendar] Errore job di sincronizzazione:",
        error,
      );
    } finally {
      running = false;
    }
  });
};
