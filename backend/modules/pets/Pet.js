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

const petSchema = new mongoose.Schema({
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
  cover: {
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
  qrToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  healthCard: {
    allergies: {
      type: [String],
      default: [],
    },
    medicalConditions: {
      type: [String],
      default: [],
    },
    emergencyNotes: {
      type: String,
      trim: true,
      default: "",
    },
    publicPhone: {
      type: String,
      trim: true,
      default: "",
    },
    publicTherapies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Therapy",
      },
    ],
  },
});

export default mongoose.model("Pet", petSchema, "pets");
