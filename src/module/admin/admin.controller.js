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


/**
 * @swagger
 * /admin/doctors:
 *   post:
 *     summary: Create a new doctor
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 required: true
 *               lastName:
 *                 type: string
 *                 required: true
 *               email:
 *                 type: string
 *                 required: true
 *               password:
 *                 type: string
 *                 required: true
 *               specialization:
 *                 type: string
 *                 required: true
 *               doctorPercentage:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: Doctor created successfully
 *       401:
 *         description: Unauthorized
 */
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


/**
 * @swagger
 * /admin/receptions:
 *   post:
 *     summary: Create a new reception
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 required: true
 *               lastName:
 *                 type: string
 *                 required: true
 *               email:
 *                 type: string
 *                 required: true
 *               password:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Reception created successfully
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 */
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


/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /admin/income:
 *   get:
 *     summary: Get income by date
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: date
 *         in: query
 *         required: true
 *         description: Date in 'YYYY-MM-DD' format
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Income retrieved successfully
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get stats
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved successfully
 *       401:
 *         description: Unauthorized
 */
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
/**
 * @swagger
 * /admin/patients:
 *   get:
 *     summary: Get all patients
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /admin/doctors/performance:
 *   get:
 *     summary: Get doctor performance
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor performance retrieved successfully
 *       401:
 *         description: Unauthorized
 */
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

/** 
 * @swagger
 * /admin/analytics/revenue:
 *   get:
 *     summary: Get monthly revenue
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly revenue retrieved successfully
 *       401:
 *         description: Unauthorized
*/
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
// ⚠️ DEBT PATIENTS WITH PAGINATION
// ================================

  /**
 * @swagger
 * /admin/alerts/debt:
 *   get:
 *     summary: Get debt patients
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Debt patients retrieved successfully
 *       401:
 *         description: Unauthorized
*/
router.get(
  "/alerts/debt",
  authentication(),
  authorization(endpoint.getAlerts),
  async (req, res) => {

    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 20)

    const data = await adminService.getHighDebtPatients(
      page,
      limit
    )

    return successResponse({
      res,
      data
    })
  }
)
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