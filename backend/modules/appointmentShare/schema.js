import mongoose from "mongoose";

const appointmentShareSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    share: {
      petName: {
        type: Boolean,
        default: true,
      },
      dateTime: {
        type: Boolean,
        default: true,
      },
      location: {
        type: Boolean,
        default: false,
      },
      veterinarian: {
        type: Boolean,
        default: false,
      },
      notes: {
        type: Boolean,
        default: false,
      },
      vetQuestions: {
        type: Boolean,
        default: false,
      },
      attendeeInstructions: {
        type: Boolean,
        default: false,
      },
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

appointmentShareSchema.index({ appointment: 1, createdBy: 1 });

const AppointmentShare = mongoose.model(
  "AppointmentShare",
  appointmentShareSchema
);

export default AppointmentShare;
