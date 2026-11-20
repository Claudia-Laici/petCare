import mongoose from "mongoose";

const PetInvitationSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ["viewer", "editor"], default: "viewer" },
    shareExpiresAt: { type: Date, default: null },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true, strict: true },
);

PetInvitationSchema.index({ pet: 1, email: 1 }, { unique: true });
PetInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("PetInvitation", PetInvitationSchema);
