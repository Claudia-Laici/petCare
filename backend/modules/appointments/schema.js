import mongoose from "mongoose";

const appointmentTypeEnum = [
  "visit",
  "checkup",
  "vaccination",
  "exam",
  "surgery",
  "other",
];

const appointmentStatusEnum = ["scheduled", "completed", "cancelled"];

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
  },
  { _id: false },
);

const checklistItemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },
  done: {
    type: Boolean,
    default: false,
  },
});

const appointmentSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: appointmentTypeEnum,
      default: "visit",
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    veterinarian: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    vetQuestions: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    attendeeInstructions: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: appointmentStatusEnum,
      default: "scheduled",
    },
    participants: {
      type: [participantSchema],
      default: [],
    },
    checklist: {
      type: [checklistItemSchema],
      default: [],
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    googleEventId: {
      type: String,
      default: null,
    },
    googleCalendarId: {
      type: String,
      default: null,
    },
    googleSyncStatus: {
      type: String,
      enum: ["not_connected", "pending", "synced", "error"],
      default: "pending",
    },
    googleSyncError: {
      type: String,
      default: "",
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    lastSyncAttemptAt: {
      type: Date,
      default: null,
    },
    syncLockToken: {
      type: String,
      default: null,
    },
    syncLockUntil: {
      type: Date,
      default: null,
    },
    idempotencyKey: {
      type: String,
      default: null,
    },
    idempotencyHash: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

appointmentSchema.pre("validate", function () {
  if (this.endAt && this.startAt && this.endAt <= this.startAt) {
    this.invalidate("endAt", "La fine deve essere successiva all'inizio");
  }
});

appointmentSchema.index({ pet: 1, startAt: 1 });
appointmentSchema.index({ createdBy: 1, startAt: 1 });
appointmentSchema.index({ "participants.user": 1, startAt: 1 });
appointmentSchema.index({ googleSyncStatus: 1, updatedAt: 1 });
appointmentSchema.index(
  { createdBy: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: { $type: "string" },
    },
  },
);

export default mongoose.model("Appointment", appointmentSchema, "appointments");
