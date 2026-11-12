import express from "express";
import { getHealthCard, updateHealthCard } from "../controllers/healthCards.js";

const HealthCardRouter = express.Router();

HealthCardRouter.get("/:petId/health-card", getHealthCard);

HealthCardRouter.patch("/:petId/health-card", updateHealthCard);

export default HealthCardRouter;
