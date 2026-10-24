import express from "express";
import {
  createPet,
  getPets,
  getPetById,
  updatePet,
  deletePet,
} from "../controllers/pets.js";

const PetRouter = express.Router();

PetRouter.post("/", createPet);

PetRouter.get("/", getPets);
PetRouter.get("/:petId", getPetById);

PetRouter.patch("/:petId", updatePet);

PetRouter.delete("/:petId", deletePet);

export default PetRouter;
