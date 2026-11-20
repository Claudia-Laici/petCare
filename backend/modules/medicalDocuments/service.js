import { v2 as cloudinary } from "cloudinary";
import MedicalDocument from "./schema.js";
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

export const updateMedicalDocument = async (documentId, data, file, userId) => {
  const document = await MedicalDocument.findById(documentId);

  if (!document) {
    if (file) await removeUploadedFile(file);

    return {
      statusCode: 404,
      data: {
        message: "Documento medico non trovato",
      },
    };
  }

  const pet = await getPetWithAccess(document.pet, userId, "editor");

  if (!pet) {
    if (file) await removeUploadedFile(file);

    return {
      statusCode: 404,
      data: {
        message: "Documento medico non trovato",
      },
    };
  }

  if (data.title !== undefined) {
    document.title = data.title.trim();
  }

  if (data.documentType !== undefined) {
    document.documentType = data.documentType;
  }

  if (data.documentDate !== undefined) {
    document.documentDate = data.documentDate || null;
  }

  if (data.description !== undefined) {
    document.description = data.description.trim();
  }

  let oldPublicId;

  if (file) {
    oldPublicId = document.publicId;

    document.fileUrl = file.path;
    document.publicId = file.filename;
    document.format = file.format;
    document.fileSize = file.size;

    document.summary = "";
    document.summaryStatus = "not_requested";
  }

  try {
    const updatedDocument = await document.save();

    if (oldPublicId) {
      await removeUploadedFile({ filename: oldPublicId });
    }

    return {
      statusCode: 200,
      data: updatedDocument,
    };
  } catch (saveError) {
    if (file) {
      await removeUploadedFile(file);
    }

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

  const pet = await getPetWithAccess(document.pet, userId, "owner");

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

  const pet = await getPetWithAccess(document.pet, userId, "editor");

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

export const getMedicalDocumentPreview = async (documentId, userId) => {
  const document = await MedicalDocument.findById(documentId);

  if (!document) {
    return {
      statusCode: 404,
      data: { message: "Documento medico non trovato" },
    };
  }

  const pet = await getPetWithAccess(document.pet, userId, "viewer");

  if (!pet) {
    return {
      statusCode: 404,
      data: { message: "Documento medico non trovato" },
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

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Impossibile recuperare il documento da Cloudinary");
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  const mimeTypes = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };

  return {
    statusCode: 200,
    data: {
      buffer,
      contentType: mimeTypes[document.format.toLowerCase()],
      filename: document.title,
    },
  };
};
