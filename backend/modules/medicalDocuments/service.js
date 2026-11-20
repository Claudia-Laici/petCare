import { v2 as cloudinary } from "cloudinary";
import MedicalDocument from "./schema.js";
import Pet from "../pets/schema.js";
import {
  getPetWithAccess,
  getAccessiblePetIds,
} from "../../utils/petAccess.js";

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

export const createMedicalDocument = async (data, file, userId) => {
  const { pet, title, documentType, documentDate, description } = data;

  if (!file) {
    return {
      statusCode: 400,
      data: {
        message: "È necessario caricare un documento",
      },
    };
  }

  const existingPet = await getPetWithAccess(pet, userId, "editor");

  if (!existingPet) {
    await removeUploadedFile(file);

    return {
      statusCode: 404,
      data: {
        message: "Animale non trovato",
      },
    };
  }

  const medicalDocument = new MedicalDocument({
    pet,
    uploadedBy: userId,
    title,
    documentType,
    documentDate: documentDate || null,
    description,
    fileUrl: file.path,
    publicId: file.filename,
    format: file.format,
    fileSize: file.size,
  });

  try {
    const savedDocument = await medicalDocument.save();

    return {
      statusCode: 201,
      data: savedDocument,
    };
  } catch (saveError) {
    await removeUploadedFile(file);
    throw saveError;
  }
};

export const getMedicalDocuments = async (userId, petId) => {
  let petIds;

  if (petId) {
    const pet = await getPetWithAccess(petId, userId, "viewer");

    if (!pet) {
      return {
        statusCode: 404,
        data: {
          message: "Animale non trovato",
        },
      };
    }

    petIds = [pet._id];
  } else {
    petIds = await getAccessiblePetIds(userId);
  }

  const documents = await MedicalDocument.find({
    pet: { $in: petIds },
  })
    .select("-publicId -fileUrl")
    .populate("pet", "name species cover owner")
    .sort({ documentDate: -1, createdAt: -1 });

  return {
    statusCode: 200,
    data: documents,
  };
};

export const getMedicalDocumentById = async (documentId, userId) => {
  const document =
    await MedicalDocument.findById(documentId).select("-publicId -fileUrl");

  if (!document) {
    return {
      statusCode: 404,
      data: {
        message: "Documento medico non trovato",
      },
    };
  }

  const pet = await getPetWithAccess(document.pet, userId, "viewer");

  if (!pet) {
    return {
      statusCode: 404,
      data: {
        message: "Documento medico non trovato",
      },
    };
  }

  return {
    statusCode: 200,
    data: document,
  };
};

export const deleteMedicalDocument = async (documentId, userId) => {
  const document = await MedicalDocument.findById(documentId);

  if (!document) {
    return {
      statusCode: 404,
      data: {
        message: "Documento medico non trovato",
      },
    };
  }

  const pet = await Pet.findOne({
    _id: document.pet,
    owner: userId,
  });

  if (!pet) {
    return {
      statusCode: 404,
      data: {
        message: "Documento medico non trovato",
      },
    };
  }

  const result = await cloudinary.uploader.destroy(document.publicId, {
    resource_type: "image",
    type: "authenticated",
    invalidate: true,
  });

  if (result.result !== "ok") {
    return {
      statusCode: 502,
      data: {
        message:
          "Impossibile eliminare il file da Cloudinary. Il documento è stato mantenuto.",
      },
    };
  }

  await document.deleteOne();

  return {
    statusCode: 200,
    data: {
      message: "Documento medico eliminato correttamente",
    },
  };
};

export const getMedicalDocumentAccessUrl = async (documentId, userId) => {
  const document = await MedicalDocument.findById(documentId);

  if (!document) {
    return {
      statusCode: 404,
      data: {
        message: "Documento medico non trovato",
      },
    };
  }

  const pet = await getPetWithAccess(document.pet, userId, "viewer");

  if (!pet) {
    return {
      statusCode: 404,
      data: {
        message: "Documento medico non trovato",
      },
    };
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

  return {
    statusCode: 200,
    data: {
      url,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
    },
  };
};
