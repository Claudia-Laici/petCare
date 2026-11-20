import express from "express";
import rateLimit from "express-rate-limit";
import { getPublicPet } from "../modules/petqrs/controller.js";
import { getPublicAppointment } from "../modules/appointmentShare/controller.js";

const PublicRouter = express.Router();

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 60, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Troppe richieste, riprova più tardi",
  },
});

PublicRouter.get("/pets/:qrToken", publicLimiter, getPublicPet);

PublicRouter.get(
  "/appointments/:token",
  publicLimiter,
  getPublicAppointment,
);

export default PublicRouter;