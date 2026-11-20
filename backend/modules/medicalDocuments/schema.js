import mongoose from "mongoose";

const medicalDocumentSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    documentType: {
      type: String,
      enum: [
        "referto",
        "analisi",
        "prescrizione",
        "vaccinazione",
        "altro",
      ],
      default: "altro",
    },
    documentDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      enum: ["pdf", "jpg", "jpeg", "png", "webp"],
      required: true,
      lowercase: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1,
    },
    summary: {
      type: String,
      default: "",
    },
    summaryStatus: {
      type: String,
      enum: ["not_requested", "pending", "completed", "failed"],
      default: "not_requested",
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: "medicalDocuments",
  },
);

export default mongoose.model("MedicalDocument", medicalDocumentSchema);