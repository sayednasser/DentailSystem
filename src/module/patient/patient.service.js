import {
  ConflictException,
  NotFoundException,
  RoleEnum,
  StatusEnum,
  uploadFiles
} from "../../common/index.js";

import { patientModel } from "../../DB/model/Patient.model.js";
import { doctorModel } from "../../DB/model/doctor.model.js";
import { AppointmentModel } from "../../DB/model/appointment.model.js";



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

   const patient = await patientModel.create({
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
    visits: [
      {
        visitDate: visitDate || new Date(),
        createdBy: user._id
      }
    ],

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
console.log(patient.visits[0])
  return patient;
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
  if (inputs.fullName) {
    const parts = inputs.fullName.trim().split(/\s+/);
    updateData.firstName = parts[0] || "";
    updateData.middleName = parts[1] || "";
    updateData.lastName = parts.slice(2).join(" ");
    delete updateData.fullName;
  }
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
      payment: {
        amount: paymentDifference,
        note: "Payment added from update",
        createdBy: user._id,
        createdAt: new Date()
      }
    };
  }
  const updatedPatient = await patientModel.findByIdAndUpdate(
    patientId,
    updateQuery,
    {
      new: true,
      runValidators: true
    }
  );

  return updatedPatient;
};
// =======================================
// ALL PATIENTS FOR DOCTOR
// =======================================
  // export const allPatient = async (user, page = 1, limit = 20) => {
  //   const populateOptions = {
  //     path: "doctorId",
  //     select: "firstName middleName lastName email phone"
  //   };

  //   const skip = (page - 1) * limit;

  //   if (user.role === RoleEnum.Doctor) {
  //     const doctor = await doctorModel.findOne({ userId: user._id });

  //     if (!doctor) {
  //       throw NotFoundException({ message: "Doctor not found" });
  //     }

  //     const filter = { doctorId: doctor.userId };

  //     const [patients, total] = await Promise.all([
  //       patientModel
  //         .find(filter)
  //         .populate(populateOptions)
  //         .sort({ createdAt: -1 })
  //         .skip(skip)
  //         .limit(limit),

  //       patientModel.countDocuments(filter)
  //     ]);

  //     return {
  //       patients,
  //       pagination: {
  //         page,
  //         limit,
  //         total,
  //         totalPages: Math.ceil(total / limit)
  //       }
  //     };
  //   }

  //   if (
  //     user.role === RoleEnum.Admin ||
  //     user.role === RoleEnum.Reception
  //   ) {
  //     const [patients, total] = await Promise.all([
  //       patientModel
  //         .find()
  //         .populate(populateOptions)
  //         .sort({ createdAt: -1 })
  //         .skip(skip)
  //         .limit(limit),

  //       patientModel.countDocuments()
  //     ]);

  //     return {
  //       patients,
  //       pagination: {
  //         page,
  //         limit,
  //         total,
  //         totalPages: Math.ceil(total / limit)
  //       }
  //     };
  //   }
  // };
  export const allPatient = async (
  user,
  page = 1,
  limit = 20,
  search = ""
) => {

  const populateOptions = {
    path: "doctorId",
    select: "firstName middleName lastName email phone"
  };

  const skip = (page - 1) * limit;

  const filter = {};

  if (search?.trim()) {
    filter.$or = [
      { phone: { $regex: search, $options: "i" } },
      { firstName: { $regex: search, $options: "i" } },
      { middleName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } }
    ];
  }

  if (user.role === RoleEnum.Doctor) {
    const doctor = await doctorModel.findOne({
      userId: user._id
    });

    if (!doctor) {
      throw NotFoundException({
        message: "Doctor not found"
      });
    }

    filter.doctorId = doctor.userId;
  }

  const [patients, total] = await Promise.all([
    patientModel
      .find(filter)
      .populate(populateOptions)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    patientModel.countDocuments(filter)
  ]);

  return {
    patients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
// =======================================
// SINGLE PATIENT
// =======================================
export const singlePatient = async (patientId, user) => {
  const doctor = await doctorModel.findOne({ userId: user._id });
  if (!doctor) throw NotFoundException({ message: "Doctor not found" });

  const patient = await patientModel.findOne({
    _id: patientId,
    doctorId: doctor.userId
  }).populate({
    path: "doctorId",
    select: "firstName middleName lastName email phone"
  });
  if (!patient) throw NotFoundException({ message: "Patient not found" });
  return patient;
};

// =======================================
// DELETE PATIENT
// =======================================
export const deletePatient = async (patientId) => {
  const patient = await patientModel.findById(patientId);
  if (!patient) {
    throw NotFoundException({ message: "Patient not found" });
  }
  await AppointmentModel.deleteMany({ patientId });
  await patient.deleteOne();
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
// export const searchPatient = async (keyword = "", user) => {
//   const filter = {
//     $or: [
//       {
//         phone: {
//           $regex: keyword,
//           $options: "i",
//         },
//       },
//       {
//         firstName: {
//           $regex: keyword,
//           $options: "i",
//         },
//       },
//       {
//         middleName: {
//           $regex: keyword,
//           $options: "i",
//         },
//       },
//       {
//         lastName: {
//           $regex: keyword,
//           $options: "i",
//         },
//       },
//     ],
//   };

//   // الدكتور يشوف مرضاه فقط
//   if (user.role === 2 || user.role === "doctor") {
//     filter.doctorId = user._id;
//   }

//   return await patientModel.find(filter).limit(20);
// };
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
// =======================================
// Add Picture to Patient 
// =======================================

export const addPatientImages = async (files, patientId) => {

  if (!files || files.length === 0) {
    throw new Error("No files uploaded");
  }

  const patient = await patientModel.findById(patientId);

  if (!patient) {
    throw new NotFoundException("Patient not found");
  }

  const uploadedImages = await uploadFiles({
    files,
    folder: `clinic/patients/${patient._id}/images`
  });
  console.log("UPLOADED:", uploadedImages);

  patient.images.push(...uploadedImages);
  console.log("PATIENT IMAGES:", patient.images);

  await patient.save();

  return patient;
};

// =======================================
// Get Picture to Patient 
// =======================================
export const getPatientImages = async (patientId) => {
  const patient = await patientModel.findById(patientId);

  if (!patient) {
    throw new Error("Patient not found");
  }

  return patient.images;
};

// =======================================
// CHECK IN PATIENT
// =======================================
export const checkInPatient = async (
  patientId,
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
      visitDate: new Date(),
      updatedBy: user._id
    },
    {
      new: true
    }
  );
};
// =======================================
// REGISTER FOLLOW-UP VISIT
// =======================================

export const registerFollowUpVisit = async (
  patientId,
  user
) => {

  const patient = await patientModel.findByIdAndUpdate(
    patientId,
    {
      $push: {
        visits: {
          visitDate: new Date(),
          createdBy: user._id
        }
      },
      $set: {
        status: StatusEnum.pending,
        updatedBy: user._id
      }
    },
    {
      new: true
    }
  );

  if (!patient) {
    throw NotFoundException({
      message: "Patient not found"
    });
  }

  return patient;
};