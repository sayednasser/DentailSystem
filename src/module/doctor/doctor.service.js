import mongoose from "mongoose";
import { patientModel, doctorModel, userModel } from "../../DB/model/index.js";
import { NotFoundException, StatusEnum } from "../../common/index.js";


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
// 📊 DOCTOR STATS 
// =======================================
export const getDoctorStats = async (userId) => {
  const doctor = await doctorModel.findOne({ userId });

  if (!doctor) {
    throw NotFoundException({
      message: "Doctor not found"
    });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [
    patientsCount,
    earningsResult,
    todayPatients
  ] = await Promise.all([

    // إجمالي مرضى الدكتور
    patientModel.countDocuments({
      doctorId: doctor.userId
    }),

    // الحسابات المالية (بدون أي تغيير)
    patientModel.aggregate([
      {
        $match: {
          doctorId: doctor.userId
        }
      },
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
          totalRemaining: {
            $subtract: ["$totalCost", "$totalIncome"]
          },
          doctorShare: {
            $multiply: ["$totalIncome", 0.4]
          }
        }
      }
    ]),

    // مرضى اليوم من جدول الزيارات
    patientModel.find({
      doctorId: doctor.userId,
      visits: {
        $elemMatch: {
          visitDate: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      }
    })
      .select(
        "firstName middleName lastName diagnosis status totalCost costPaid visits"
      )
      .sort({ updatedAt: -1 })
  ]);

  const earnings = earningsResult[0] || {
    totalIncome: 0,
    totalRemaining: 0,
    doctorShare: 0
  };

  return {
    patients: patientsCount,

    totalIncome: earnings.totalIncome,

    doctorShare: earnings.doctorShare,

    remaining: earnings.totalRemaining,

    todayPatientsCount: todayPatients.length,

    todayPatients
  };
};


// =======================================
// 📊 DOCTOR DASHBOARD
// =======================================
export const getDoctorDashboard = async (userId) => {

  const doctor = await doctorModel.findOne({ userId });

  if (!doctor) {
    throw NotFoundException({
      message: "Doctor not found"
    });
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  let activePatient = await patientModel.findOne({
    doctorId: doctor.userId,
    status: "active",
    visits: {
      $elemMatch: {
        visitDate: {
          $gte: start,
          $lte: end
        }
      }
    }
  });

  if (!activePatient) {

    activePatient = await patientModel.findOne({
      doctorId: doctor.userId,
      status: "pending",
      visits: {
        $elemMatch: {
          visitDate: {
            $gte: start,
            $lte: end
          }
        }
      }
    }).sort({
      "visits.visitDate": 1
    });

    if (activePatient) {
      activePatient.status = "active";
      await activePatient.save();
    }
  }

  const query = {
    doctorId: doctor.userId,
    status: {
      $in: [
        StatusEnum.pending,
        StatusEnum.active
      ]
    },
    visits: {
      $elemMatch: {
        visitDate: {
          $gte: start,
          $lte: end
        }
      }
    }
  };

  const [todayPatients, todayPatientsCount] = await Promise.all([

    patientModel
      .find(query)
      .sort({ "visits.visitDate": 1 })
      .limit(6),

    patientModel.countDocuments(query)

  ]);
  console.log("================================");
  console.log(
    todayPatients.map(p => ({
      name: p.firstName,
      status: p.status,
      doctorId: p.doctorId,
      visits: p.visits
    }))
  );

  return {
    todayPatients,
    todayPatientsCount
  };
};

// =======================================
// 📊  all DOCTOR 
// =======================================

export const getAllDoctors = async () => {
  const doctors = await doctorModel
    .find()
    .populate("userId", "firstName middleName lastName");

  return doctors;
}




// =======================================
// 📊 DOCTOR workingHours 
// =======================================

export const updateWorkingHours = async (doctorId, workingHours) => {

  const doctor = await doctorModel.findOne({ userId: doctorId });

  if (!doctor) {
    throw NotFoundException({
      message: "Doctor not found",
    });
  }

  doctor.workingHours = workingHours;

  await doctor.save();

  return doctor;
};

// =======================================
// ✅ COMPLETE PATIENT
// =======================================
export const completePatient = async (userId, patientId) => {

  const doctor = await doctorModel.findOne({ userId });

  if (!doctor) {
    throw NotFoundException({
      message: "Doctor not found"
    });
  }

  // إنهاء المريض الحالي
  const patient = await patientModel.findOneAndUpdate(
    {
      _id: patientId,
      doctorId: doctor.userId,
      status: StatusEnum.active
    },
    {
      status: StatusEnum.completed
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

  // حدود اليوم
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  // البحث عن أول مريض في الانتظار
  const nextPatient = await patientModel.findOne({
    doctorId: doctor.userId,
    status: StatusEnum.pending,
    visits: {
      $elemMatch: {
        visitDate: {
          $gte: start,
          $lte: end
        }
      }
    }
  }).sort({
    "visits.visitDate": 1
  });

  // تفعيل المريض التالي إن وجد
  if (nextPatient) {
    await patientModel.updateOne(
      { _id: nextPatient._id },
      {
        status: StatusEnum.active
      }
    );

    nextPatient.status = StatusEnum.active;
  }

  return {
    completedPatient: patient,
    currentPatient: nextPatient
  };
};