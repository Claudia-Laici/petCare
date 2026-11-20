import express from "express";
import {
  createMedicalDocument,
  updateMedicalDocument,
  getMedicalDocuments,
  getMedicalDocumentById,
  deleteMedicalDocument,
  getMedicalDocumentAccessUrl,
  getMedicalDocumentPreview,
} from "./controller.js";
import {
  uploadMedicalDocument,
  validateAndUploadMedicalDocument,
  validateAndUploadMedicalDocumentOptional,
} from "../../middlewares/globals/cloudinary.js";

const MedicalDocumentRouter = express.Router();

MedicalDocumentRouter.get("/", getMedicalDocuments);

MedicalDocumentRouter.get("/:id/access-url", getMedicalDocumentAccessUrl);

MedicalDocumentRouter.get("/:id/preview", getMedicalDocumentPreview);

MedicalDocumentRouter.get("/:id", getMedicalDocumentById);

MedicalDocumentRouter.post(
  "/",
  uploadMedicalDocument.single("document"),
  validateAndUploadMedicalDocument,
  createMedicalDocument,
);

MedicalDocumentRouter.patch(
  "/:id",
  uploadMedicalDocument.single("document"),
  validateAndUploadMedicalDocumentOptional,
  updateMedicalDocument,
);

MedicalDocumentRouter.delete("/:id", deleteMedicalDocument);

export default MedicalDocumentRouter;
