import { userModel, patientModel, doctorModel } from "../../DB/model/index.js";
import { ConflictException, hashPassword, RoleEnum, NotFoundException } from "../../common/index.js";

// ================================
// 👨‍⚕️ CREATE DOCTOR
// ================================
export const createDoctor = async (inputs, admin) => {
  const { email, password, fullName, specialization, phone, age } = inputs;

  const exist = await userModel.findOne({ email });
  if (exist) throw ConflictException({ message: "Email already exists" });

  const hashedPassword = await hashPassword({ plainText: password });

  const doctorUser = await userModel.create({
    fullName,
    email,
    password: hashedPassword,
    role: RoleEnum.Doctor,
    createdBy: admin._id,
    phone,
    age
  });
  console.log({ doctorUser });
  await doctorModel.create({
    userId: doctorUser._id,
    specialization
  });

  return doctorUser;
};

// ================================
// 🧾 CREATE RECEPTION
// ================================
export const createReception = async (inputs, admin) => {
  const { email, password, fullName , phone, age,} = inputs;

  const exist = await userModel.findOne({ email });
  if (exist) throw ConflictException({ message: "Email already exists" });

  const hashedPassword = await hashPassword({ plainText: password });

  const createReception = await userModel.create({
    fullName,
    email,
    password: hashedPassword, 
    role: RoleEnum.Reception,
    createdBy: admin._id,
    phone,
    age
  });

  return await createReception.save();
};

// ================================
// 👥 USERS
// ================================
export const getAllUsers = async () => {
  return await userModel.find({ role: { $in: [RoleEnum.Doctor, RoleEnum.Reception] } }).select("-password");
};

// ================================
// 📊 STATS
// ================================
export const getStats = async () => {
  const [doctors, reception, patients, revenueResult] = await Promise.all([
    userModel.countDocuments({ role: RoleEnum.Doctor }),
    userModel.countDocuments({ role: RoleEnum.Reception }),
    patientModel.countDocuments(),
    patientModel.aggregate([{ $group: { _id: null, total: { $sum: "$costPaid" } } }])
  ]);

  return {
    doctors,
    reception,
    patients,
    revenue: revenueResult[0]?.total || 0
  };
};


// ================================
// 👨‍⚕️ DOCTOR PERFORMANCE
// ================================

export const getDoctorPerformance = async () => {
  const result = await patientModel.aggregate([
    {
      $group: {
        _id: "$doctorId",

        patientsCount: { $sum: 1 },

        revenue: { $sum: "$costPaid" },

        totalCost: { $sum: "$totalCost" },

        completedCases: {
          $sum: {
            $cond: [
              { $eq: ["$status", "completed"] },
              1,
              0
            ]
          }
        },

        pendingCases: {
          $sum: {
            $cond: [
              { $ne: ["$status", "completed"] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: "doctor",
        localField: "_id",
        foreignField: "userId",
        as: "doctor"
      }
    },
    {
      $unwind: "$doctor"
    },
    {
      $lookup: {
        from: "User",
        localField: "doctor.userId",
        foreignField: "_id",
        as: "user"
      }
    }, { 
      $unwind: "$user"
    },
    {
   
      $project: {
        doctorName: {
          $concat: [
            { $ifNull: ["$user.firstName", ""] },
            " ",
            { $ifNull: ["$user.lastName", ""] }
          ]
        },

        specialization: "$doctor.specialization",

        patientsCount: 1,

        completedCases: 1,

        pendingCases: 1,

        doctorPercentage: "$doctor.doctorPercentage",

        // إجمالي حق الدكتور من كل الحالات
        doctorTotalRights: {
          $multiply: [
            "$totalCost",
            { $divide: ["$doctor.doctorPercentage", 100] }
          ]
        },

        // المستحق حالياً للدكتور من الفلوس المدفوعة
        doctorReceived: {
          $multiply: [
            "$revenue",
            { $divide: ["$doctor.doctorPercentage", 100] }
          ]
        },

        // المتبقي للدكتور من المبالغ غير المحصلة
        doctorRemaining: {
          $multiply: [
            {
              $subtract: [
                "$totalCost",
                "$revenue"
              ]
            },
            {
              $divide: ["$doctor.doctorPercentage", 100]
            }
          ]
        }
      }
    
    }

  ])

console.log(JSON.stringify(result, null, 2))

return result
}

// ================================
// 📈 MONTHLY REVENUE
// ================================
export const getMonthlyRevenue = async () => {
  return await patientModel.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$costPaid" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// ================================
// ⚠️ DEBT PATIENTS (الديون)
// ================================
export const getHighDebtPatients = async () => {
  return await patientModel.find({
    $expr: { $gt: ["$totalCost", "$costPaid"] }
  }).limit(10);
};

// ================================
// 💰 RECENT PAYMENTS
// ================================
export const getRecentPayments = async () => {
  return await patientModel.find({ "payments.amount": { $exists: true } })
    .sort({ "payments.createdAt": -1 })
    .limit(5);
};

// ================================
// 📊 DASHBOARD
// ================================
export const getAdminDashboard = async () => {
  const [stats, recentPatients, doctorPerformance, monthlyRevenue, highDebtPatients, recentPayments] = await Promise.all([
    getStats(),
    patientModel.find().sort({ createdAt: -1 }).limit(5).populate("doctorId"),
    getDoctorPerformance(),
    getMonthlyRevenue(),
    getHighDebtPatients(),
    getRecentPayments()
  ]);

  return { stats, recentPatients, doctorPerformance, monthlyRevenue, highDebtPatients, recentPayments };
};