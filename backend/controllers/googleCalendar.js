import User from "../modules/users/schema.js";
import Appointment from "../modules/appointments/schema.js";
import {
  createCalendarAuthorizationUrl,
  consumeCalendarState,
  exchangeCalendarCode,
} from "../services/googleCalendarOAuth.js";
import { encryptToken } from "../services/tokenEncryption.js";
import { revokeGoogleRefreshToken } from "../services/googleCalendarService.js";
import { queueFutureAppointmentsForSync } from "../services/appointmentGoogleSync.js";
import { retryUserFutureAppointments } from "../services/appointmentSyncRetry.js";

const redirectToFrontend = (res, status) => {
  const url = new URL("/appointments", process.env.FRONTEND_URL);
  url.searchParams.set("googleCalendar", status);

  return res.redirect(url.toString());
};

export const connectGoogleCalendar = async (req, res, next) => {
  try {
    const url = await createCalendarAuthorizationUrl(req.user._id);

    res.status(200).json({ url });
  } catch (error) {
    next(error);
  }
};

export const googleCalendarCallback = async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      if (typeof state === "string") {
        try {
          await consumeCalendarState(state);
        } catch {
          // State scaduto o non valido: il rifiuto dell'autorizzazione resta valido.
        }
      }

      return redirectToFrontend(res, "denied");
    }

    if (typeof code !== "string" || typeof state !== "string") {
      return redirectToFrontend(res, "error");
    }

    const stateUser = await consumeCalendarState(state);
    const { tokens, accountEmail } = await exchangeCalendarCode(code);

    const user = await User.findById(stateUser._id).select(
      "+googleCalendar.refreshTokenEncrypted",
    );

    if (!user) {
      throw new Error("Utente PetCare non trovato");
    }

    const previousEmail = user.googleCalendar?.accountEmail;
    const previousRefreshToken = user.googleCalendar?.refreshTokenEncrypted;

    if (!tokens.refresh_token) {
      if (!previousRefreshToken || previousEmail !== accountEmail) {
        throw new Error("Refresh token Google non disponibile");
      }
    }

    user.googleCalendar = {
      ...user.googleCalendar?.toObject?.(),
      connected: true,
      accountEmail,
      calendarId: "primary",
      refreshTokenEncrypted: tokens.refresh_token
        ? encryptToken(tokens.refresh_token)
        : previousRefreshToken,
      syncToken:
        previousEmail && previousEmail !== accountEmail
          ? null
          : (user.googleCalendar?.syncToken ?? null),
      connectedAt: new Date(),
    };

    await user.save();

    await queueFutureAppointmentsForSync(user._id);

    retryUserFutureAppointments(user._id).catch((error) =>
      console.error("[Google Calendar] Errore sincronizzazione:", error),
    );

    return redirectToFrontend(res, "connected");
  } catch (error) {
    console.error("Errore collegamento Google Calendar:", error);

    return redirectToFrontend(res, "error");
  }
};

export const getGoogleCalendarStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      "googleCalendar.connected googleCalendar.accountEmail googleCalendar.connectedAt",
    );

    const syncErrors = await Appointment.countDocuments({
      createdBy: req.user._id,
      deletedAt: null,
      googleSyncStatus: "error",
    });

    res.status(200).json({
      connected: Boolean(user?.googleCalendar?.connected),
      accountEmail: user?.googleCalendar?.accountEmail ?? null,
      connectedAt: user?.googleCalendar?.connectedAt ?? null,
      syncErrors,
    });
  } catch (error) {
    next(error);
  }
};

export const disconnectGoogleCalendar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      "+googleCalendar.refreshTokenEncrypted",
    );

    if (user?.googleCalendar?.refreshTokenEncrypted) {
      await revokeGoogleRefreshToken(user.googleCalendar.refreshTokenEncrypted);
    }

    await User.findByIdAndUpdate(req.user._id, {
      $set: { "googleCalendar.connected": false },
      $unset: { "googleCalendar.refreshTokenEncrypted": 1 },
    });

    await Appointment.updateMany(
      { createdBy: req.user._id, deletedAt: null },
      { $set: { googleSyncStatus: "not_connected", googleSyncError: "" } },
      { timestamps: false },
    );

    res.status(200).json({ message: "Google Calendar scollegato" });
  } catch (error) {
    next(error);
  }
};

export const syncGoogleCalendarAppointments = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      "googleCalendar.connected",
    );

    if (!user?.googleCalendar?.connected) {
      return res.status(400).json({
        message: "Google Calendar non è collegato.",
      });
    }

    await queueFutureAppointmentsForSync(user._id);

    const results = await retryUserFutureAppointments(user._id);

    return res.status(200).json({
      message: "Sincronizzazione completata.",
      ...results,
    });
  } catch (error) {
    next(error);
  }
};
