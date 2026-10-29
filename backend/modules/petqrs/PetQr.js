import mongoose from "mongoose";

const petQrSchema = new mongoose.Schema(
  {
    pet: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Pet", required: 
      true, 
      unique: true 
    },
    token: { 
      type: String, 
      required: true, 
      unique: true 
    },
  },
  { timestamps: true },
);
export default mongoose.model("PetQr", petQrSchema, "petqrs");