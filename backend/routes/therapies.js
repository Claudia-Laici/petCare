import express from "express";
import {
  createTherapy,
  getTherapies,
  getTherapyById,
  updateTherapy,
  deleteTherapy,
} from "../controllers/therapies.js";

const TherapyRouter = express.Router();

TherapyRouter.post("/", createTherapy);

TherapyRouter.get("/", getTherapies);
TherapyRouter.get("/:therapyId", getTherapyById);

TherapyRouter.patch("/:therapyId", updateTherapy);

TherapyRouter.delete("/:therapyId", deleteTherapy);

export default TherapyRouter;
