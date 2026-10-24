import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../modules/users/User.js";

export function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token non valido",
    });
  }

  const jwtToken = authHeader.split(" ")[1];

  jwt.verify(jwtToken, process.env.JWT_SECRET, async function (error, payload) {
    if (error) {
      return res.status(401).json({
        message: "Token non valido",
      });
    }

    try {
      if (
        typeof payload !== "object" ||
        !payload ||
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
    } catch (e) {
      next(e);
    }
  });
}
