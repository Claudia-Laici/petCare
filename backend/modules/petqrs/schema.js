import mongoose from "mongoose";

const petQrSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
      unique: true,
    },
    token: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },

    share: {
      photo: { type: Boolean, default: true },
      breed: { type: Boolean, default: false },
      sex: { type: Boolean, default: false },
      microchip: { type: Boolean, default: false },
      contact: { type: Boolean, default: false },
      conditions: { type: Boolean, default: false },
      allergies: { type: Boolean, default: false },
      therapies: { type: Boolean, default: false },
    },
    message: { type: String, trim: true, maxlength: 300, default: "" },
    contactPhone: { type: String, trim: true, maxlength: 30, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("PetQr", petQrSchema, "petqrs");
