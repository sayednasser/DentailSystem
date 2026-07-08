import { Router } from "express";
import { authentication, authorization, validation } from "../../middleware/index.js";
import { successResponse } from "../../common/index.js";

import {
  getMyPatients,
  getDoctorStats,
  getDoctorDashboard,
  getDoctorProfile,
  updateDoctorProfile,
  updateWorkingHours,
  getAllDoctors,
  completePatient
} from "./doctor.service.js";

import * as validators from "./doctor.validation.js";
import { endpoint } from "./doctor.authorization.js";

const router = Router();


// ================================
// 👨‍⚕️ DASHBOARD
// ================================
router.get(
  "/dashboard",
  authentication(),
  async (req, res) => {
    const data = await getDoctorDashboard(req.user._id);

    return successResponse({
      res,
      data
    });
  }
);


// ================================
// 👥 MY PATIENTS
// ================================
router.get(
  "/patients",
  authentication(),
  async (req, res) => {
    const data = await getMyPatients(req.user._id);
    return successResponse({
      res,
      data
    });
  }
);


// ================================
// 📊 MY STATS
// ================================
router.get(
  "/stats",
  authentication(),
  async (req, res) => {
    const data = await getDoctorStats(req.user._id);

    return successResponse({
      res,
      data
    });
  }
);


// ================================
// 👤 MY PROFILE
// ================================
router.get(
  "/profile",
  authentication(),
  authorization(endpoint.dashboard),
  async (req, res) => {
    const data = await getDoctorProfile(req.user._id);

    return successResponse({
      res,
      data
    });
  }
);


// ================================
// ✏️ UPDATE PROFILE
// ================================
router.patch(
  "/profile",
  authentication(),
  authorization(endpoint.dashboard),
  validation(validators.updateProfile),
  async (req, res) => {
    const data = await updateDoctorProfile(
      req.user,
      req.body
    );

    return successResponse({
      res,
      data
    });
  }
);

// =======================================
// 📊 DOCTOR workingHours 
// =======================================

router.put("/working-hours/:doctorId", authentication(),validation(validators.updateWorkingHoursValidation), async (req, res) => {

  const { doctorId } = req.params;

  const { workingHours } = req.body;

  const data = await updateWorkingHours(
    doctorId,
    workingHours
  );

  return successResponse({
    res,
    status: 200,
    data,
  });

});

// =======================================
// 📊 GIT ALL DOCTOR  
// =======================================

router.get(
  "/all",
  authentication(),
  async (req, res) => {
 const data = await getAllDoctors(req.user)
    return successResponse({
      res,
      status: 200,
      data,
    });
  }
);

// ================================
// ✅ COMPLETE PATIENT
// ================================
router.patch(
  "/patients/:patientId/complete",
  authentication(),
  async (req, res) => {

    const data = await completePatient(
      req.user._id,
      req.params.patientId
    );

    return successResponse({
      res,
      data
    });
  }
);

export default router;