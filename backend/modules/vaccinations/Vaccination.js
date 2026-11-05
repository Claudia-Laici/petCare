import mongoose from "mongoose";

const vaccinationSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dateAdministered: {
      type: Date,
      required: true,
    },
    nextDueDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          return !value || value >= this.dateAdministered;
        },
        message:
          "La prossima scadenza deve essere successiva alla data di somministrazione",
      },
    },
    isSingleDose: {
  type: Boolean,
  default: false,
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
  },
  {
    timestamps: true,
    strict: true,
    collection: "vaccinations",
  },
);
vaccinationSchema.pre("validate", function () {
  if (this.isSingleDose) this.nextDueDate = null;
});

const Vaccination = mongoose.model("Vaccination", vaccinationSchema);

export default Vaccination;
