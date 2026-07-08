import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patient",
      required: true,
      index: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    totalCost: {
      type: Number,
      default: 0,
    },

    doctorPercentage: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "scheduled",
    },

    bookedBy: {
      type: String,
      enum: [
        "admin",
        "doctor",
        "online",
      ],
      default: "admin",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "Appointment",
  }
);


// منع حجز نفس الدكتور في نفس الوقت
appointmentSchema.index(
  {
    doctorId: 1,
    date: 1,
    startTime: 1,
  },
  {
    unique: true,
  }
);


export const AppointmentModel =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);