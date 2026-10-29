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
    publicPhone: { 
      type: String, 
      trim: true, 
      default: "" 
    },
    publicTherapies: [{
       type: mongoose.Schema.Types.ObjectId, 
       ref: "Therapy" 
      }],
  },
  { timestamps: true },
);
export default mongoose.model("HealthCard", healthCardSchema, "healthcards");
