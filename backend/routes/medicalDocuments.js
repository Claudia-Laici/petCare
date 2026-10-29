import express from "express";
import {
  createMedicalDocument,
  getMedicalDocuments,
  getMedicalDocumentById,
  deleteMedicalDocument,
  getMedicalDocumentAccessUrl,
} from "../controllers/medicalDocuments.js";
import {
  uploadMedicalDocument,
  validateAndUploadMedicalDocument,
} from "../middlewares/cloudinary.js";

const MedicalDocumentRouter = express.Router();

MedicalDocumentRouter.get("/", getMedicalDocuments);
MedicalDocumentRouter.get(
  "/:id/access-url",
  getMedicalDocumentAccessUrl,
);
MedicalDocumentRouter.get("/:id", getMedicalDocumentById);

MedicalDocumentRouter.post(
  "/",
  uploadMedicalDocument.single("document"),
  validateAndUploadMedicalDocument,
  createMedicalDocument,
);

MedicalDocumentRouter.delete("/:id", deleteMedicalDocument);

export default MedicalDocumentRouter;
