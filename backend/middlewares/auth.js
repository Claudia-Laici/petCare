import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { OAuth2Client } from "google-auth-library";
import User from "../modules/users/User.js";

export async function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token non valido",
    });
  }

  const jwtToken = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);

    if (
      !payload ||
      typeof payload !== "object" ||
      !mongoose.isValidObjectId(payload.id)
    ) {
      return res.status(401).json({
        message: "Token non valido",
      });
    }

    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({
        message: "Profilo non trovato",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Token non valido",
      });
    }

    next(error);
  }
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function googleLogin(req, res, next) {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: "Credenziale Google mancante" });
  }

  let googleUser;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    googleUser = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: "Token Google non valido" });
  }

  try {
    const { sub, email, email_verified, given_name, family_name, picture } =
      googleUser;

    if (!email_verified) {
      return res.status(401).json({ message: "Email Google non verificata" });
    }

    let user = await User.findOne({ googleId: sub });

    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        user.googleId = sub;
        await user.save();
      } else {
        user = await User.create({
          googleId: sub,
          email: email.toLowerCase(),
        });
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.json({ token, user });
  } catch (e) {
    next(e);
  }
}
