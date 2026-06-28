import { Router } from "express";
import { authentication, authorization, validation } from "../../middleware/index.js";
import { successResponse } from "../../common/index.js";
import * as validators from "./admin.validation.js";
import * as adminService from "./admin.service.js"; // استيراد الـ service كاملة
import { endpoint } from "../patient/patient.authorization.js";

const router = Router();

// ================================
// 👨‍⚕️ CREATE DOCTOR
// ================================
router.post(
  "/doctors",
  authentication(),
  authorization(endpoint.createDoctor),
  validation(validators.createDoctor),
  async (req, res) => {
    const data = await adminService.createDoctor(req.body, req.user);
    return successResponse({ res, status: 201, data });
  }
);

// ================================
// 🧾 CREATE RECEPTION
// ================================
router.post(
  "/receptions",
  authentication(),
  authorization(endpoint.createReception),
  validation(validators.createReception),
  async (req, res) => {
    const data = await adminService.createReception(req.body, req.user);
    return successResponse({ res, status: 201, data });
  }
);


// ================================
// 👥 GET ALL USERS
// ================================
router.get(
  "/users",
  authentication(),
  authorization(endpoint.getAdminDashboard),
  async (req, res) => {
    const data = await adminService.getAllUsers();
    return successResponse({ res, data });
  }
);
// ================================
// 👥 Delete USERS
// ================================

router.delete(
  "/users/:id",
  authentication(),
  authorization(endpoint.deleteUser),
  async (req, res) => {
    const user = await adminService.deleteUser(req.params.id);
    return successResponse({
      res, message: "User deleted successfully", data: user
    });
  }
);
// ================================
// 👥 income by date
// ================================
router.get(
  "/income",
  authentication(),
  async (req, res) => {
    const data = await adminService.getIncomeByDate(req.query.date);
    console.log({ data })
    return successResponse({
      res,
      data
    });
  }
);
// ================================
// 📊 STATS 
// ================================
router.get(
  "/stats",
  authentication(),
  authorization(endpoint.getStats),
  async (req, res) => {
    const data = await adminService.getStats();
    return successResponse({ res, data });
  }
);

// ================================
// 🧾 ALL PATIENTS
// ================================
router.get(
  "/patients",
  authentication(),
  authorization(endpoint.getPatients),
  async (req, res) => {
    const data = await adminService.getAllPatientsForAdmin();
    return successResponse({ res, data });
  }
);

// ================================
// 📊 DASHBOARD
// ================================
router.get(
  "/dashboard",
  authentication(),
  authorization(endpoint.getAdminDashboard),
  async (req, res) => {
    const data = await adminService.getAdminDashboard();
    return successResponse({ res, data });
  }
);

// ================================
// 👨‍⚕️ DOCTOR PERFORMANCE
// ================================
router.get(
  "/doctors/performance",
  authentication(),
  authorization(endpoint.getDoctorPerformance),
  async (req, res) => {
    const data = await adminService.getDoctorPerformance();
    return successResponse({ res, data });
  }
);

// ================================
// 📈 MONTHLY REVENUE
// ================================
router.get(
  "/analytics/revenue",
  authentication(),
  authorization(endpoint.getAnalytics),
  async (req, res) => {
    const data = await adminService.getMonthlyRevenue();
    return successResponse({ res, data });
  }
);

// ================================
// ⚠️ DEBT PATIENTS
// ================================
router.get(
  "/alerts/debt",
  authentication(),
  authorization(endpoint.getAlerts),
  async (req, res) => {
    const data = await adminService.getHighDebtPatients();
    return successResponse({ res, data });
  }
);

// ================================
// 💰 RECENT PAYMENTS
// ================================
router.get(
  "/payments/recent",
  authentication(),
  authorization(endpoint.getPayments),
  async (req, res) => {
    const data = await adminService.getRecentPayments();
    return successResponse({ res, data });
  }
);

// ================================
//  Create Expense
// ================================
router.post(
  "/expenses",
  authentication(),
  authorization(endpoint.manageExpenses), 
  async (req, res) => {
    const data = await adminService.createExpense(req.body, req.user);

    return successResponse({
      res,
      status: 201,
      data,
    });
  } 
);
// ================================
//  get Expense
// ================================
router.get(
  "/expenses",
  authentication(),
  authorization(endpoint.getExpenses),
  async (req, res) => {
    const data = await adminService.getExpenses();

    return successResponse({
      res,
      data,
    });
  }
);
// ================================
//  Delete Expense
// ================================
router.delete(
  "/expenses/:id",
  authentication(),
  authorization(endpoint.manageExpenses),
  async (req, res) => {
    const data = await adminService.deleteExpense(req.params.id);

    return successResponse({
      res,
      data,
    });
  }
);

export default router;