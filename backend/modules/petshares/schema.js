import mongoose from "mongoose";

const petShareSchema = new mongoose.Schema(
  {
    pet: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Pet", 
      required: true 
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    role: { 
      type: String, 
      enum: ["viewer", "editor"], 
      default: "viewer" 
    },
    expiresAt: { 
      type: Date, 
      default: null 
    },
  },
  { timestamps: true },
);
petShareSchema.index({ pet: 1, user: 1 }, { unique: true });

petShareSchema.index({ user: 1 });

petShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("PetShare", petShareSchema, "petshares");