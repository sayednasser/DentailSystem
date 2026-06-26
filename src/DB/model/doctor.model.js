import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    firstName: { type: String },
    lastName: { type: String },

    specialization: {
      type: String,
      required: true
    },

    doctorPercentage: {
      type: Number,
      default: 40
    },

    paidAmount: {
      type: Number,
      default: 0
    },

    workingHours: {
      from: String,
      to: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "doctor"
  }
);

doctorSchema.virtual("fullName")
  .get(function () {
    return `${this.firstName || ""} ${this.lastName || ""}`.trim();
  })
  .set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName;
    this.lastName = lastName;
  });

doctorSchema.virtual("patients", {
  ref: "patient",
  localField: "_id",
  foreignField: "doctorId"
});

export const doctorModel =
  mongoose.models.doctor ||
  mongoose.model("doctor", doctorSchema);