import {
  ConflictException,
  NotFoundException,
  RoleEnum
} from "../../common/index.js";

import { patientModel } from "../../DB/model/Patient.model.js";
import { doctorModel } from "../../DB/model/doctor.model.js";



// =======================================
// CREATE PATIENT
// =======================================
export const createPatient = async (inputs, user) => {
  const {
    fullName, address, phone, age, notes, gender, totalCost,
    costPaid, doctorId, diagnosis, treatment, visitDate, nextVisit, status
  } = inputs;
const [firstName, ...rest] = fullName.trim().split(" ");
const lastName = rest.join(" ");

const checkPatient = await patientModel.findOne({
  firstName,
  lastName
});
  // const checkPatient = await patientModel.findOne({ fullName });
  if (checkPatient) throw ConflictException({ message: "Patient already exists" });
  if (Number(costPaid) > Number(totalCost)) {
    throw ConflictException({ message: "Cost paid can't be greater than total cost" });
  }

  const doctor = await doctorModel.findOne({ userId: doctorId });
  if (!doctor) throw NotFoundException({ message: "Doctor not found" });

  return await patientModel.create({
    fullName, address, phone, age, notes, gender, doctorId,
    diagnosis, treatment, status, visitDate, nextVisit,
    createdBy: user._id,
    totalCost: Number(totalCost),
    costPaid: Number(costPaid), status
  });
};

// =======================================
// UPDATE PATIENT
// =======================================
export const updatePatient = async (patientId, inputs, user) => {
  const patient = await patientModel.findById(patientId);
  if (!patient) throw NotFoundException({ message: "Patient not found" });

  const checkPatient = await patientModel.findOne({
    phone: inputs.phone,
    _id: { $ne: patientId }
  });
  if (checkPatient) throw ConflictException({ message: "Patient already exists" });

  const updateData = { ...inputs, updatedBy: user._id };

  if (inputs.totalCost !== undefined && inputs.costPaid !== undefined) {
    if (Number(inputs.costPaid) > Number(inputs.totalCost)) {
      throw ConflictException({ message: "Cost paid can't be greater than total cost" });
    }
    updateData.totalCost = Number(inputs.totalCost);
    updateData.costPaid = Number(inputs.costPaid);
  }

  return await patientModel.findByIdAndUpdate(patientId, updateData, { new: true });
};

// =======================================
// ALL PATIENTS FOR DOCTOR
// =======================================
export const allPatient = async (user) => {
  const populateOptions = {
    path: "doctorId",
    populate: { path: "doctorId", select: "firstName lastName email" }
  };

  if (user.role === RoleEnum.Doctor) {
    const doctor = await doctorModel.findOne({ userId: user._id });
    if (!doctor) throw NotFoundException({ message: "Doctor not found" });
    return await patientModel.find({ doctorId: doctor.userId }).populate(populateOptions);
  }

  if (user.role === RoleEnum.Admin || user.role === RoleEnum.Reception) {
    return await patientModel.find().populate(populateOptions);
  }
};

// =======================================
// SINGLE PATIENT
// =======================================
export const singlePatient = async (patientId, user) => {
  const doctor = await doctorModel.findOne({ userId: user._id });
  if (!doctor) throw NotFoundException({ message: "Doctor not found" });

  const patient = await patientModel.findOne({ _id: patientId, doctorId: doctor.userId })
    .populate({ path: "doctorId", populate: { path: "userId", select: "firstName lastName email" } });

  if (!patient) throw NotFoundException({ message: "Patient not found" });
  return patient;
};

// =======================================
// DELETE PATIENT
// =======================================
export const deletePatient = async (patientId) => {
  const deleted = await patientModel.findByIdAndDelete(patientId);
  if (!deleted) throw NotFoundException({ message: "Patient not found" });
  return { success: true };
};

// =======================================
// ADD PAYMENT (Atomic Operation)
// =======================================
export const addPayment = async (patientId, amount, note, user) => {
  const patient = await patientModel.findById(patientId);
  if (!patient) throw NotFoundException({ message: "Patient not found" });

  if ((patient.costPaid + Number(amount)) > patient.totalCost) {
    throw ConflictException({ message: "Payment exceeds total cost" });
  }

  // تحديث الـ payments والـ costPaid في عملية واحدة
  return await patientModel.findByIdAndUpdate(
    patientId,
    {
      $push: { payments: { amount: Number(amount), note, createdBy: user._id, createdAt: new Date() } },
      $inc: { costPaid: Number(amount) }
    },
    { new: true }
  );
};




// =======================================
// SEARCH PATIENT
// =======================================
export const searchPatient = async (
  keyword,
  user
) => {

  const doctor = await doctorModel.findOne({
    userId: user._id
  });

  if (!doctor) {
    throw NotFoundException({
      message: "Doctor not found"
    });
  }

  return await patientModel.find({
    doctorId: doctor.userId,

    $or: [
      {
        fullName: {
          $regex: keyword,
          $options: "i"
        }
      },
      {
        phone: {
          $regex: keyword,
          $options: "i"
        }
      }
    ]
  });
};





// =======================================
// UPDATE STATUS
// =======================================
export const updatePatientStatus = async (
  patientId,
  status,
  user
) => {

  const patient = await patientModel.findById(
    patientId
  );

  if (!patient) {
    throw NotFoundException({
      message: "Patient not found"
    });
  }

  return await patientModel.findByIdAndUpdate(
    patientId,
    {
      status,
      updatedBy: user._id
    },
    {
      new: true
    }
  );
};




// =======================================
// UPDATE DIAGNOSIS
// =======================================
export const updateDiagnosis = async (
  patientId,
  diagnosis,
  user
) => {

  const doctor = await doctorModel.findOne({
    userId: user._id
  });
  if (!doctor) {
    throw NotFoundException({
      message: "Doctor not found for this user"
    });
  }

  return await patientModel.findOneAndUpdate(
    {
      _id: patientId,
      doctorId: doctor.userId
    },
    {
      diagnosis,
      updatedBy: doctor.userId
    },
    {
      new: true
    }
  );
};


// =======================================
// UPDATE TREATMENT PLAN
// =======================================
export const updateTreatmentPlan = async (
  patientId,
  treatment,
  user
) => {

  const doctor = await doctorModel.findOne({
    userId: user._id
  });
  if (!doctor) {
    throw NotFoundException({
      message: "Doctor not found for this user"
    });
  }

  console.log(doctor);
  const updated = await patientModel.findOneAndUpdate(
    {
      _id: patientId,
      doctorId: doctor.userId
    },
    {
      treatment,
      updatedBy: doctor.userId
    },
    {
      new: true
    }
  )
  if (!updated) {
    throw NotFoundException({
      message: "Patient not found or not updated"
    });
  } return updated
}