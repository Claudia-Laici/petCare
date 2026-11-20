import { google } from "googleapis";
import User from "../modules/users/schema.js";
import { decryptToken } from "./tokenEncryption.js";

const DEFAULT_DURATION_MS = 30 * 60 * 1000;

const createOAuthClient = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_CALLBACK_URL,
  );

const statusOf = (error) => Number(error?.response?.status ?? error?.code);

const eventIdFor = (appointment) =>
  appointment.googleEventId || appointment._id.toString();

export const getGoogleCalendarClient = async (userId) => {
  const user = await User.findById(userId).select(
    "googleCalendar.connected +googleCalendar.refreshTokenEncrypted",
  );

  if (!user?.googleCalendar?.connected) {
    throw new Error("Google Calendar non collegato");
  }

  if (!user.googleCalendar.refreshTokenEncrypted) {
    throw new Error("Refresh token Google non disponibile");
  }

  const oauthClient = createOAuthClient();

  oauthClient.setCredentials({
    refresh_token: decryptToken(user.googleCalendar.refreshTokenEncrypted),
  });

  return google.calendar({ version: "v3", auth: oauthClient });
};

export const revokeGoogleRefreshToken = async (encryptedToken) => {
  try {
    await createOAuthClient().revokeToken(decryptToken(encryptedToken));
  } catch (error) {
    console.warn(
      "[Google Calendar] Revoca del token non riuscita. Potrebbe essere già scaduto o revocato:",
      error.message,
    )
  }
};

const buildEvent = (appointment) => {
  const startAt = new Date(appointment.startAt);
  const endAt = appointment.endAt
    ? new Date(appointment.endAt)
    : new Date(startAt.getTime() + DEFAULT_DURATION_MS);

  if (
    Number.isNaN(startAt.getTime()) ||
    Number.isNaN(endAt.getTime()) ||
    endAt <= startAt
  ) {
    throw new Error("Date dell'appuntamento non valide");
  }

  const checklist = (appointment.checklist || [])
    .map((item) => `${item.done ? "[x]" : "[ ]"} ${item.text}`)
    .join("\n");

  const description = [
    appointment.veterinarian
      ? `Veterinario: ${appointment.veterinarian}`
      : null,
    appointment.notes || null,
    checklist ? `Da controllare:\n${checklist}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    summary: appointment.title,
    description,
    location: appointment.location || "",
    start: { dateTime: startAt.toISOString() },
    end: { dateTime: endAt.toISOString() },
    extendedProperties: {
      private: { petCareAppointmentId: appointment._id.toString() },
    },
  };
};

export const upsertGoogleCalendarEvent = async (
  userId,
  appointment,
  calendarId = "primary",
) => {
  const calendar = await getGoogleCalendarClient(userId);
  const eventId = eventIdFor(appointment);
  const body = buildEvent(appointment);

  try {
    const { data } = await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: { ...body, status: "confirmed" },
    });
    return data;
  } catch (error) {
    if (![404, 410].includes(statusOf(error))) throw error;
  }

  try {
    const { data } = await calendar.events.insert({
      calendarId,
      requestBody: { ...body, id: eventId },
    });
    return data;
  } catch (error) {
    if (statusOf(error) !== 409) throw error;
  }

  const { data } = await calendar.events.update({
    calendarId,
    eventId,
    requestBody: { ...body, status: "confirmed" },
  });
  return data;
};

export const deleteGoogleCalendarEvent = async (
  userId,
  appointment,
  calendarId = "primary",
) => {
  const calendar = await getGoogleCalendarClient(userId);

  try {
    await calendar.events.delete({
      calendarId,
      eventId: eventIdFor(appointment),
    });
  } catch (error) {
    if (![404, 410].includes(statusOf(error))) {
      throw error;
    }
  }
};
