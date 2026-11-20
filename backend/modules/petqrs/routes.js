import express from "express";
import {
  enableQr,
  getQr,
  regenerateQr,
  disableQr,
  updateQrSettings,
} from "./controller.js";

const PetQrRouter = express.Router();

PetQrRouter.get("/:petId/qr", getQr);

PetQrRouter.post("/:petId/qr", enableQr);

PetQrRouter.post("/:petId/qr/regenerate", regenerateQr);

PetQrRouter.patch("/:petId/qr/settings", updateQrSettings);

PetQrRouter.delete("/:petId/qr", disableQr);

export default PetQrRouter;
