import mongoose from "mongoose";
import { patientModel, doctorModel,userModel } from "../../DB/model/index.js";
import { NotFoundException } from "../../common/index.js";


// =======================================
// 👤 GET DOCTOR PROFILE
// =======================================
export const getDoctorProfile = async (userId) => {

  const doctor = await doctorModel
    .findOne({ userId })
    .populate("userId");
  if (!doctor) {
    throw NotFoundException({ message: "Doctor not found" });
  }

  return doctor;
};


// =======================================
// ✏️ UPDATE DOCTOR PROFILE
// =======================================
export const updateDoctorProfile = async (user, inputs) => {
  const doctor = await doctorModel.findOne({ userId: user._id });
  if (!doctor) {
    throw NotFoundException({ message: "Doctor not found" });
  }

  
  const userData = {};
  if (inputs.phone) userData.phone = inputs.phone;
  if (inputs.fullName) {
      const names = inputs.fullName.split(" ");
      userData.firstName = names[0];
      userData.lastName = names.slice(1).join(" ");
  }

  if (Object.keys(userData).length > 0) {
      await userModel.findByIdAndUpdate(user._id, userData);
  }

  // 3. تحديث بيانات الدكتور (في Doctor Model)
  const doctorData = {};
  if (inputs.specialization) doctorData.specialization = inputs.specialization;
  if (inputs.bio) doctorData.bio = inputs.bio;

  const updatedDoctor = await doctorModel.findOneAndUpdate(
    { userId: user._id }, // استخدمنا user._id بدلاً من userId غير المعرف
    doctorData,
    { new: true }
  );

  return updatedDoctor;
};

// =======================================
// 👥 GET MY PATIENTS
// =======================================
export const getMyPatients = async (doctorId) => {


  const patients = await patientModel
    .find({ doctorId })
    .populate("createdBy", "firstName lastName role")
    .sort({ createdAt: -1 });

  return patients;
};


// =======================================
// 👤 GET SINGLE PATIENT
// =======================================
export const getSinglePatient = async (userId, patientId) => {

  const doctor = await doctorModel.findOne({ userId });

  if (!doctor) {
    throw NotFoundException({ message: "Doctor not found" });
  }

  const patient = await patientModel
    .findOne({
      _id: patientId,
      doctorId: doctor._id
    })
    .populate("doctorId")
    .populate("createdBy", "firstName lastName");

  if (!patient) {
    throw NotFoundException({ message: "Patient not found" });
  }

  return patient;
};


// =======================================
// 🔍 SEARCH PATIENT
// =======================================
export const searchPatient = async (userId, keyword) => {

  const doctor = await doctorModel.findOne({ userId });

  if (!doctor) {
    throw NotFoundException({ message: "Doctor not found" });
  }

  return await patientModel.find({
    doctorId: doctor._id,
    fullName: {
      $regex: keyword,
      $options: "i"
    }
  });
};


// =======================================
// 📝 UPDATE PATIENT NOTES
// =======================================
export const updatePatientNotes = async (
  userId,
  patientId,
  notes
) => {

  const doctor = await doctorModel.findOne({ userId });

  if (!doctor) {
    throw NotFoundException({ message: "Doctor not found" });
  }

  const patient = await patientModel.findOneAndUpdate(
    {
      _id: patientId,
      doctorId: doctor._id
    },
    {
      notes
    },
    {
      new: true
    }
  );

  if (!patient) {
    throw NotFoundException({ message: "Patient not found" });
  }

  return patient;
};


// =======================================
// 📊 DOCTOR STATS (المُصحح)
// =======================================
export const getDoctorStats = async (userId) => {
  const doctor = await doctorModel.findOne({ userId });
  if (!doctor) throw NotFoundException({ message: "Doctor not found" });

  const [patientsCount, earningsResult] = await Promise.all([
    patientModel.countDocuments({ doctorId: doctor.userId }),
    patientModel.aggregate([
      { $match: { doctorId: doctor.userId } },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: "$costPaid" },
          totalCost: { $sum: "$totalCost" }
        }
      },
      {
        $project: {
          totalIncome: 1,
          // الحساب الصحيح للمتبقي باستخدام القيم الفعلية
          totalRemaining: { $subtract: ["$totalCost", "$totalIncome"] },
          // حساب حصة الدكتور (استخدام النسبة المخزنة في الدكتور أو ثابتة 0.4)
          doctorShare: { $multiply: ["$totalIncome", 0.4] }
        }
      }
    ])
  ]);

  const earnings = earningsResult[0] || { totalIncome: 0, totalRemaining: 0, doctorShare: 0 };

  return {
    patients: patientsCount,
    totalIncome: earnings.totalIncome,
    doctorShare: earnings.doctorShare,
    remaining: earnings.totalRemaining
  };
};


// =======================================
// 📊 DOCTOR DASHBOARD
// =======================================
export const getDoctorDashboard = async (userId) => {

  const doctor = await doctorModel.findOne({ userId });

  if (!doctor) {
    throw NotFoundException({ message: "Doctor not found" });
  }

  const [stats, recentPatients] = await Promise.all([

    getDoctorStats(userId),

    patientModel
      .find({
        doctorId: doctor.userId
      })
      .sort({ createdAt: -1 })
      .limit(5)

  ]);

  return {
    stats,
    recentPatients
  };
};