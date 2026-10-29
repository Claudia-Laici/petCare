import express from "express";
import {
  createPet,
  getPets,
  getPetById,
  updatePet,
  updateHealthCard,
  sharePet,
  enableQr,
  unsharePet,
  disableQr,
  deletePet,
} from "../controllers/pets.js";

const PetRouter = express.Router();

PetRouter.post("/", createPet);

PetRouter.get("/", getPets);
PetRouter.get("/:petId", getPetById);

PetRouter.patch("/:petId", updatePet);
PetRouter.patch("/:petId/health-card", updateHealthCard);

PetRouter.post("/:petId/share", sharePet);
PetRouter.post("/:petId/qr", enableQr);

PetRouter.delete("/:petId/share/:userId", unsharePet);
PetRouter.delete("/:petId/qr", disableQr);
PetRouter.delete("/:petId", deletePet);

export default PetRouter;
