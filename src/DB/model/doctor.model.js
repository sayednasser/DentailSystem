import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    firstName: {
      type: String,
    },

    middleName: {
      type: String,
    },

    lastName: {
      type: String,
    },

    specialization: {
      type: String,
      required: true,
    },

    doctorPercentage: {
      type: Number,
      default: 40,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    // Weekly Schedule
    workingHours: [
      {
        day: {
          type: String,
          enum: [
            "Saturday",
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
          ],
          required: true,
        },

        startTime: {
          type: String,
          required: true,
        },

        endTime: {
          type: String,
          required: true,
        },

        slotDuration: {
          type: Number,
          default: 30,
        },

        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "doctor",
  }
);

doctorSchema.virtual("fullName")
  .get(function () {
    return `${this.firstName || ""} ${this.middleName || ""} ${this.lastName || ""}`.trim();
  })
  .set(function (value) {
    const names = value.trim().split(" ");

    this.firstName = names[0] || "";
    this.middleName = names.length > 2 ? names.slice(1, -1).join(" ") : names[1] || "";
    this.lastName = names.length > 2 ? names[names.length - 1] : names[2] || "";
  });

doctorSchema.virtual("patients", {
  ref: "patient",
  localField: "_id",
  foreignField: "doctorId",
});

export const doctorModel =
  mongoose.models.doctor ||
  mongoose.model("doctor", doctorSchema);