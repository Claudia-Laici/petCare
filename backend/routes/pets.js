import express from "express";
import {
  createPet,
  getPets,
  getPetById,
  updatePet,
  deletePet,
  authorizePetEditor,
  updatePetAvatar,
} from "../controllers/pets.js";

import { uploadPetAvatar } from "../middlewares/cloudinary.js";

const PetRouter = express.Router();

PetRouter.post("/", createPet);

PetRouter.get("/", getPets);
PetRouter.get("/:petId", getPetById);

PetRouter.patch("/:petId", updatePet);
PetRouter.patch(
  "/:petId/avatar",
  authorizePetEditor,
  uploadPetAvatar.single("avatar"),
  updatePetAvatar,
);

PetRouter.delete("/:petId", deletePet);

export default PetRouter;