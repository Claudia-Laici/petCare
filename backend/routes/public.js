import express from "express";
import rateLimit from "express-rate-limit";
import { getPublicPet } from "../controllers/pets.js";

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

export default PublicRouter;