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
  const [firstName, , middleName, ...rest] = fullName.trim().split(" ");
  const lastName = rest.join(" ");

  const checkPatient = await patientModel.findOne({
    firstName,
    middleName,
  });
  // const checkPatient = await patientModel.findOne({ fullName });
  if (checkPatient) throw ConflictException({ message: "Patient already exists" });
  if (Number(costPaid) > Number(totalCost)) {
    throw ConflictException({ message: "Cost paid can't be greater than total cost" });
  }

  const doctor = await doctorModel.findOne({ userId: doctorId });
  if (!doctor) throw NotFoundException({ message: "Doctor not found" });

  return await patientModel.create({
    fullName,
    address,
    phone,
    age,
    notes,
    gender,
    doctorId,
    diagnosis,
    treatment,
    status,
    visitDate,
    nextVisit,
    createdBy: user._id,

    totalCost: Number(totalCost),
    costPaid: Number(costPaid),

    payment:
      Number(costPaid) > 0
        ? [
          {
            amount: Number(costPaid),
            createdBy: user._id,
            note: "الدفعة الأولى",
          },
        ]
        : [],
  });
};

// =======================================
// UPDATE PATIENT
// =======================================
export const updatePatient = async (patientId, inputs, user) => {
  const patient = await patientModel.findById(patientId);

  if (!patient) {
    throw NotFoundException({
      message: "Patient not found"
    });
  }

  const checkPatient = await patientModel.findOne({
    phone: inputs.phone,
    _id: { $ne: patientId }
  });

  if (checkPatient) {
    throw ConflictException({
      message: "Patient already exists"
    });
  }

  const updateData = {
    ...inputs,
    updatedBy: user._id
  };

  let paymentDifference = 0;

  if (
    inputs.totalCost !== undefined &&
    inputs.costPaid !== undefined
  ) {
    const newTotalCost = Number(inputs.totalCost);
    const newCostPaid = Number(inputs.costPaid);

    if (newCostPaid > newTotalCost) {
      throw ConflictException({
        message: "Cost paid can't be greater than total cost"
      });
    }

    paymentDifference =
      newCostPaid - Number(patient.costPaid || 0);

    updateData.totalCost = newTotalCost;
    updateData.costPaid = newCostPaid;
  }

  const updateQuery = {
    $set: updateData
  };

  if (paymentDifference > 0) {
    updateQuery.$push = {
      payments: {
        amount: paymentDifference,
        note: "Payment added from update",
        createdBy: user._id,
        createdAt: new Date()
      }
    };
  }

  return await patientModel.findByIdAndUpdate(
    patientId,
    updateQuery,
    { new: true }
  );
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
// 1) INCREASE TOTAL COST (without touching old value)
// =======================================
export const increaseTotalCost = async (patientId, addAmount) => {
  const add = Number(addAmount || 0);

  if (add <= 0) {
    throw ConflictException({ message: "Invalid amount to add" });
  }

  const updated = await patientModel.findOneAndUpdate(
    { _id: patientId },
    { $inc: { totalCost: add } },
    { new: true }
  );

  if (!updated) {
    throw ConflictException({ message: "Patient not found" });
  }

  return updated;
};

// =======================================
// 2) ADD PAYMENT (installment), validated against CURRENT totalCost only
// =======================================
export const addPayment = async (patientId, amount, note, user) => {
  const value = Number(amount || 0);

  if (value <= 0) {
    throw ConflictException({ message: "Invalid payment amount" });
  }

  const updated = await patientModel.findOneAndUpdate(
    {
      _id: patientId,
      $expr: {
        $lte: [
          { $add: ["$costPaid", value] },
          "$totalCost"
        ]
      }
    },
    {
      $push: {
        payment: {
          amount: value,
          note: note || "",
          createdBy: user._id,
          createdAt: new Date()
        }
      },
      $inc: { costPaid: value }
    },
    { new: true }
  );

  if (!updated) {
    throw ConflictException({
      message: "Payment exceeds remaining total cost"
    });
  }

  return updated;
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