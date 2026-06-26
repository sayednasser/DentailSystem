import { Router } from "express";
import { authentication, authorization, validation } from "../../middleware/index.js";
import { successResponse } from "../../common/index.js";
import * as service from "./patient.service.js"; // استيراد كل الدوال من الـ service
import * as validators from "./patient.validation.js";
import { endpoint } from "./patient.authorization.js";

const router = Router();

// =======================================
// CREATE PATIENT
// =======================================
router.post(
  "/",
  authentication(),
  authorization(endpoint.createPatient),
  validation(validators.addPatient),
  async (req, res) => {
    const data = await service.createPatient(req.body, req.user);
    return successResponse({ res, status: 201, data });
  }
);

// =======================================
// SEARCH PATIENT
// =======================================
router.get(
  "/search",
  authentication(),
  async (req, res) => {
    const data = await service.searchPatient(req.query.keyword, req.user);
    return successResponse({ res, data });
  }
);

// =======================================
// GET ALL PATIENTS (DOCTOR)
// =======================================
router.get(
  "/",
  authentication(),
  async (req, res) => {
    const data = await service.allPatient(req.user);
    return successResponse({ res, data });
  }
);

// =======================================
// GET SINGLE PATIENT
// =======================================
router.get(
  "/:patientId",
  authentication(),
  async (req, res) => {
    const data = await service.singlePatient(req.params.patientId, req.user);
    return successResponse({ res, data });
  }
);

// =======================================
// UPDATE PATIENT
// =======================================
router.patch(
  "/:patientId",
  authentication(),
  authorization(endpoint.updatePatient),
  validation(validators.updatePatient),
  async (req, res) => {
    const data = await service.updatePatient(req.params.patientId, req.body, req.user);
    return successResponse({ res, data });
  }
);

// =======================================
// DELETE PATIENT
// =======================================
router.delete(
  "/:patientId",
  authentication(),
  authorization(endpoint.deletePatient),
  async (req, res) => {
    const data = await service.deletePatient(req.params.patientId);
    return successResponse({ res, data });
  }
);

// =======================================
// UPDATE STATUS
// =======================================
router.patch(
  "/:patientId/status",
  authentication(),
  async (req, res) => {
    const data = await service.updatePatientStatus(req.params.patientId, req.body.status, req.user);
    return successResponse({ res, data });
  }
);

// =======================================
// ADD PAYMENT
// =======================================
router.patch(
  "/:patientId/payment",
  authentication(),
  validation(validators.addPayment),
  async (req, res) => {
    const data = await service.addPayment(req.params.patientId, req.body.amount, req.body.note, req.user);
    return successResponse({ res, data });
  }
);

// =======================================
// UPDATE DIAGNOSIS
// =======================================
router.patch(
  "/:patientId/diagnosis",
  authentication(),
  authorization(endpoint.updatePatientDoctor),
  validation(validators.updateDiagnosis),
  async (req, res) => {
    const data = await service.updateDiagnosis(req.params.patientId, req.body.diagnosis, req.user);
    return successResponse({ res, data });
  }
);

// =======================================
// UPDATE TREATMENT PLAN
// =======================================
router.patch(
  "/:patientId/treatment",
  authentication(),
  authorization(endpoint.updatePatientDoctor),
  validation(validators.updateDiagnosis),
  async (req, res) => {
    const data = await service.updateTreatmentPlan(req.params.patientId, req.body.treatment, req.user);
    return successResponse({ res, data });
  }
);

export default router;