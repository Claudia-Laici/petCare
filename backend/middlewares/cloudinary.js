import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { fileTypeFromBuffer } from "file-type";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createStorage = (folder, allowedFormats, extraParams = {}) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: allowedFormats,
      ...extraParams,
    },
  });

const imageFormats = ["jpg", "jpeg", "png", "webp"];

const medicalDocumentFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(new Error("Formato non supportato. Carica un PDF o un'immagine valida."));
};

export const uploadPetAvatar = multer({
  storage: createStorage("petCare/pets", imageFormats),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadUserAvatar = multer({
  storage: createStorage("petCare/users", imageFormats),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadMedicalDocument = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: medicalDocumentFilter,
});

export const validateAndUploadMedicalDocument = async (req, res, next) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({
        message: "È necessario caricare un documento",
      });
    }

    const detectedType = await fileTypeFromBuffer(req.file.buffer);

    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !detectedType ||
      !allowedMimeTypes.includes(detectedType.mime) ||
      detectedType.mime !== req.file.mimetype
    ) {
      return res.status(400).json({
        message: "Il contenuto del file non è valido o non è supportato",
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "petCare/medical-documents",
          resource_type: "image",
          type: "authenticated",
          allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      uploadStream.end(req.file.buffer);
    });

    req.file.path = uploadResult.secure_url;
    req.file.filename = uploadResult.public_id;
    req.file.format = uploadResult.format;
    req.file.size = uploadResult.bytes;
    req.file.mimetype = detectedType.mime;

    next();
  } catch (error) {
    next(error);
  }
};
