import express from "express";
import {
  sharePet,
  unsharePet,
  getPetShares,
  revokeInvitation,
} from "./controller.js";

const PetSharesRouter = express.Router();

PetSharesRouter.get("/:petId/shares", getPetShares);

PetSharesRouter.post("/:petId/shares", sharePet);

PetSharesRouter.delete("/:petId/shares/:userId", unsharePet);
PetSharesRouter.delete("/:petId/invitations/:invitationId", revokeInvitation);

export default PetSharesRouter;
