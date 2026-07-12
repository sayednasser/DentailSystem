import { Router } from "express";
import { authentication, authorization, validation } from "../../middleware/index.js";
import { successResponse } from "../../common/index.js";
import { uploadCloud } from "../../common/types/multer/cloud.multer.js";

import * as service from "./patient.service.js";
import * as validators from "./patient.validation.js";
import { endpoint } from "./patient.authorization.js";
import { filedValidation } from "../../common/types/multer/multer.validation.js";

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
    return successResponse({
      res,
      status: 201,
      data,
    });
  }
);

// =======================================
// SEARCH PATIENT
// // =======================================
// router.get(
//   "/search",
//   authentication(),
//   async (req, res) => {
//     const data = await service.searchPatient(
//       req.query.keyword,
//       req.user
//     );

//     return successResponse({
//       res,
//       data,
//     });
//   }
// );

// =======================================
// GET ALL PATIENTS
// =======================================
router.get(
  "/",
  authentication(),
  async (req, res) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search || "";

    const data = await service.allPatient(
      req.user,
      page,
      limit,
      search
    );

    return successResponse({
      res,
      data
    });
  }
);

// =======================================
// GET SINGLE PATIENT
// =======================================
router.get(
  "/:patientId",
  authentication(),
  async (req, res) => {
    const data = await service.singlePatient(
      req.params.patientId,
      req.user
    );

    return successResponse({
      res,
      data,
    });
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
    console.log("req.body", req.body);
    const data = await service.updatePatient(
      req.params.patientId,
      req.body,
      req.user
    );

    return successResponse({
      res,
      data,
    });
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
    const data = await service.deletePatient(
      req.params.patientId
    );

    return successResponse({
      res,
      data,
    });
  }
);

// =======================================
// UPDATE STATUS
// =======================================
router.patch(
  "/:patientId/status",
  authentication(),
  async (req, res) => {
    const data = await service.updatePatientStatus(
      req.params.patientId,
      req.body.status,
      req.user
    );

    return successResponse({
      res,
      data,
    });
  }
);

// =======================================
// INCREASE TOTAL COST
// =======================================
router.patch(
  "/:id/increase-total",
  authentication(),
  async (req, res) => {
    const { addAmount } = req.body;

    const data = await service.increaseTotalCost(
      req.params.id,
      addAmount
    );

    return successResponse({
      res,
      data,
    });
  }
);

// =======================================
// ADD PAYMENT
// =======================================
router.patch(
  "/:patientId/payment",
  authentication(),
  async (req, res) => {
    const { amount, note } = req.body;

    const data = await service.addPayment(
      req.params.patientId,
      amount,
      note,
      req.user
    );

    return successResponse({
      res,
      data,
    });
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
    const data = await service.updateDiagnosis(
      req.params.patientId,
      req.body.diagnosis,
      req.user
    );

    return successResponse({
      res,
      data,
    });
  }
);

// =======================================
// UPDATE TREATMENT
// =======================================
router.patch(
  "/:patientId/treatment",
  authentication(),
  authorization(endpoint.updatePatientDoctor),
  validation(validators.updateDiagnosis),
  async (req, res) => {
    const data = await service.updateTreatmentPlan(
      req.params.patientId,
      req.body.treatment,
      req.user
    );

    return successResponse({
      res,
      data,
    });
  }
);

// =======================================
// Add Picture to Patient 
// =======================================
router.post(
  "/:id/images",
  authentication(), uploadCloud({ validation: filedValidation.image }).array("attachments", 10),
  async (req, res) => {
    const patient = await service.addPatientImages(req.files, req.params.id);
    return successResponse({ res, data: patient });
  }
);
// =======================================
// Get Picture to Patient  
// =======================================
router.get("/:id/images", authentication(), async (req, res) => {
  const images = await service.getPatientImages(req.params.id);
  return successResponse({
    res,
    data: images
  });
});

// =======================================
// CHECK IN PATIENT
// =======================================
router.patch(
  "/:patientId/check-in",
  authentication(),
  async (req, res) => {

    const data = await service.checkInPatient(
      req.params.patientId,
      req.user
    );

    return successResponse({
      res,
      data,
    });
  }
);
// =======================================
// REGISTER FOLLOW-UP VISIT
// =======================================

router.patch("/:patientId/followup",
  authentication(), async (req, res) => {
    const data = await service.registerFollowUpVisit(req.params.patientId, req.user);
    return successResponse({ res, data });
  }
);

export default router;  