import express from "express";
import {
  sharePet,
  unsharePet,
  getPetShares,
  revokeInvitation,
  updateShareRole,
} from "./controller.js";

const PetSharesRouter = express.Router();

PetSharesRouter.get("/:petId/shares", getPetShares);

PetSharesRouter.post("/:petId/shares", sharePet);

PetSharesRouter.patch("/:petId/shares/:userId", updateShareRole);

PetSharesRouter.delete("/:petId/shares/:userId", unsharePet);
PetSharesRouter.delete("/:petId/invitations/:invitationId", revokeInvitation);

export default PetSharesRouter;
