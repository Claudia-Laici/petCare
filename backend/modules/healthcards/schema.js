import mongoose from "mongoose";

const healthCardSchema = new mongoose.Schema(
  {
    pet: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Pet", 
      required: true, 
      unique: true
     },
    allergies: { 
      type: [String],
       default: []
       },
    medicalConditions: {
       type: [String], 
       default: [] 
      },
    emergencyNotes: { 
      type: String, 
      trim: true, 
      default: "" 
    },
    contactPhone: { 
      type: String, 
      trim: true, 
      default: "" 
    },
  },
  { timestamps: true },
);
export default mongoose.model("HealthCard", healthCardSchema, "healthcards");
