import jwt from "jsonwebtoken";
import mongoose from "mongoose";
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