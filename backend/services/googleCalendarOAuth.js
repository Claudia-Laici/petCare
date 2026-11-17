import { OAuth2Client } from "google-auth-library";
import { randomBytes, createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import User from "../modules/users/User.js";

const createOAuthClient = () => {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_CALLBACK_URL
  );
};

const calendarScopes = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.events",
];

export const createCalendarAuthorizationUrl = async (userId) => {
  const nonce = randomBytes(32).toString("hex");

  const state = jwt.sign(
    {
      userId: userId.toString(),
      nonce,
      purpose: "google-calendar",
    },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );

  const stateHash = createHash("sha256")
    .update(nonce)
    .digest("hex");

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        "googleCalendar.oauthStateHash": stateHash,
        "googleCalendar.oauthStateExpiresAt": new Date(
          Date.now() + 10 * 60 * 1000
        ),
      },
    },
    { new: true }
  );

  if (!user) {
    throw new Error("Utente PetCare non trovato");
  }

  const oauthClient = createOAuthClient();

  return oauthClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: calendarScopes,
    state,
  });
};

export const consumeCalendarState = async (state) => {
  const payload = jwt.verify(state, process.env.JWT_SECRET);

  if (
    typeof payload !== "object" ||
    payload.purpose !== "google-calendar" ||
    !payload.userId ||
    !payload.nonce
  ) {
    throw new Error("State OAuth non valido");
  }

  const stateHash = createHash("sha256")
    .update(payload.nonce)
    .digest("hex");

  const user = await User.findOneAndUpdate(
    {
      _id: payload.userId,
      "googleCalendar.oauthStateHash": stateHash,
      "googleCalendar.oauthStateExpiresAt": {
        $gt: new Date(),
      },
    },
    {
      $unset: {
        "googleCalendar.oauthStateHash": 1,
        "googleCalendar.oauthStateExpiresAt": 1,
      },
    },
    { new: true }
  );

  if (!user) {
    throw new Error("Autorizzazione OAuth scaduta o non valida");
  }

  return user;
};

export const exchangeCalendarCode = async (code) => {
  const oauthClient = createOAuthClient();

  const { tokens } = await oauthClient.getToken(code);

  if (!tokens.id_token) {
    throw new Error("Token identificativo Google mancante");
  }

  const ticket = await oauthClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const googleAccount = ticket.getPayload();

  if (!googleAccount?.email || !googleAccount.email_verified) {
    throw new Error("Account Google non verificato");
  }

  return {
    tokens,
    accountEmail: googleAccount.email.toLowerCase(),
  };
};