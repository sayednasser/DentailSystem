import mongoose, { Types } from "mongoose";
import { GenderEnum, StatusEnum } from "../../common/index.js";

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },

    note: String,

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);
const visitSchema = new mongoose.Schema(
  {
    visitDate: {
      type: Date,
      default: Date.now
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User"
    }
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, min: 3, max: 25 },
    middleName: { type: String, required: false, min: 3, max: 25 },
    lastName: { type: String, required: false, min: 3, max: 25 },
    phone: {
      type: String,
      required: false
    },
    age: Number,
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.male
    },
    diagnosis: String,
    treatment: String,
    notes: String,
   
    status: {
      type: String,
      enum: StatusEnum,
      default: StatusEnum.pending
    },
    totalCost: {
      type: Number,
      default: 0
    },
    costPaid: {
      type: Number,
      default: 0
    },
    doctorPercentage: {
      type: Number,
      default: 0,
      required: true
    },
   visits: [visitSchema],
    payment: [paymentSchema],
    address: String,
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User"
    },
    images: [
      {
        public_id: String,
        secure_url: String,
      }
    ]
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: "patients",
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

patientSchema.virtual("fullName")
  .get(function () {
    return `${this.firstName || ""} ${this.middleName || ""} ${this.lastName || ""}`.trim();
  })
  .set(function (value) {
    const [firstName, middleName, lastName] = value.split(" ");
    this.firstName = firstName;
    this.middleName = middleName;
    this.lastName = lastName;

  });

patientSchema.virtual("remainingAmount").get(function () {
  const total = this.totalCost || 0;
  const paid = this.costPaid || 0;
  return total - paid;
});
export const patientModel =
  mongoose.models.patient ||
  mongoose.model("patient", patientSchema);   