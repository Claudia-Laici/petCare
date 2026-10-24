import { v2 as cloudinary } from "cloudinary";
import MedicalDocument from "../modules/medicalDocuments/MedicalDocument.js";
import Pet from "../modules/pets/Pet.js";

const removeUploadedFile = async (file) => {
  if (!file?.filename) return;

  try {
    await cloudinary.uploader.destroy(file.filename, {
      resource_type: "image",
      type: "authenticated",
      invalidate: true,
    });
  } catch (cleanupError) {
    console.error(
      "Errore durante la rimozione del file da Cloudinary:",
      cleanupError,
    );
  }
};

export const createMedicalDocument = async (req, res, next) => {
  console.log("Utente autenticato:", req.user?._id);
  try {
    const { pet, title, documentType, documentDate, description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "È necessario caricare un documento",
      });
    }

    const existingPet = await Pet.findOne({
      _id: pet,
      owner: req.user._id,
    });

    if (!existingPet) {
      await removeUploadedFile(req.file);

      return res.status(404).json({
        message: "Animale non trovato",
      });
    }

    const medicalDocument = new MedicalDocument({
      pet,
      uploadedBy: req.user._id,
      title,
      documentType,
      documentDate: documentDate || null,
      description,
      fileUrl: req.file.path,
      publicId: req.file.filename,
      format: req.file.format,
      fileSize: req.file.size,
    });

    try {
      const savedDocument = await medicalDocument.save();

      return res.status(201).json(savedDocument);
    } catch (saveError) {
      await removeUploadedFile(req.file);
      throw saveError;
    }
  } catch (e) {
    next(e);
  }
};


export const getMedicalDocuments = async (req, res, next) => {
  try {
    const { petId } = req.query;

    if (petId) {
      const existingPet = await Pet.findOne({
        _id: petId,
        owner: req.user._id,
      });

      if (!existingPet) {
        return res.status(404).json({
          message: "Animale non trovato",
        });
      }
    }

    const filters = {
      uploadedBy: req.user._id,
    };

    if (petId) {
      filters.pet = petId;
    }

    const documents = await MedicalDocument.find(filters)
      .select("-publicId -fileUrl")
      .sort({ documentDate: -1, createdAt: -1 });

    return res.status(200).json(documents);
  } catch (error) {
    next(error);
  }
};


export const getMedicalDocumentById = async (req, res, next) => {
  try {
    const document = await MedicalDocument.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    }).select("-publicId -fileUrl");

    if (!document) {
      return res.status(404).json({
        message: "Documento medico non trovato",
      });
    }

    return res.status(200).json(document);
  } catch (error) {
    next(error);
  }
};


export const deleteMedicalDocument = async (req, res, next) => {
  try {
    const document = await MedicalDocument.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Documento medico non trovato",
      });
    }

    const result = await cloudinary.uploader.destroy(
      document.publicId,
      {
        resource_type: "image",
        type: "authenticated",
        invalidate: true,
      },
    );

    if (result.result !== "ok") {
      return res.status(502).json({
        message:
          "Impossibile eliminare il file da Cloudinary. Il documento è stato mantenuto.",
      });
    }

    await document.deleteOne();

    return res.status(200).json({
      message: "Documento medico eliminato correttamente",
    });
  } catch (error) {
    next(error);
  }
};


export const getMedicalDocumentAccessUrl = async (req, res, next) => {
  try {
    const document = await MedicalDocument.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Documento medico non trovato",
      });
    }

    const expiresAt = Math.floor(Date.now() / 1000) + 60;

    const url = cloudinary.utils.private_download_url(
      document.publicId,
      document.format,
      {
        resource_type: "image",
        type: "authenticated",
        expires_at: expiresAt,
      },
    );

    return res.status(200).json({
      url,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
    });
  } catch (error) {
    next(error);
  }
};


