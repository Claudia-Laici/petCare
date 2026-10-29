import mongoose from "mongoose";

const speciesEnum = [
  "dog",
  "cat",
  "rabbit",
  "bird",
  "reptile",
  "rodent",
  "other",
];

const petSchema = new mongoose.Schema(
  {
    species: {
      type: String,
      enum: speciesEnum,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    birthDate: {
      type: Date,
      default: null,
    },
    sex: {
      type: String,
      enum: ["male", "female", "unknown"],
      default: "unknown",
    },
    sterilized: {
      type: Boolean,
      default: false,
    },
    microchipNumber: {
      type: String,
      trim: true,
      default: "",
    },
    cover: {
      type: String,
      default: null,
    },
    coverPublicId: {
      type: String,
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    breed: {
      type: String,
      trim: true,
      default: "",
    },
    healthCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HealthCard",
      default: null,
    },
    qr: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PetQr",
      default: null,
    },
  },
  { timestamps: true },
);

petSchema.index({ owner: 1 });

export default mongoose.model("Pet", petSchema, "pets");
