import express from "express";
import {
  createVaccination,
  getVaccinations,
  getVaccinationById,
  updateVaccination,
  deleteVaccination,
} from "../controllers/vaccinations.js";

const VaccinationRouter = express.Router();

VaccinationRouter.post("/", createVaccination);

VaccinationRouter.get("/", getVaccinations);
VaccinationRouter.get("/:vaccinationId", getVaccinationById);

VaccinationRouter.patch("/:vaccinationId", updateVaccination);

VaccinationRouter.delete("/:vaccinationId", deleteVaccination);

export default VaccinationRouter;
