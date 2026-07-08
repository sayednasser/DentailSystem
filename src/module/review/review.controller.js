import { Router } from "express";

import {
  createReview,
  getApprovedReviews,
  getAllReviews,
  approveReview,
  deleteReview
} from "./review.service.js";
import { successResponse } from "../../common/index.js";
import { authentication } from "../../middleware/authentication.middleware.js";

const router = Router();


// ================================
// ✅ CREATE REVIEW
// ================================
router.post(
  "/",
  async (req, res) => {

    const data = await createReview(req.body);

    return successResponse({
      res,
      data
    });
  }
);


// ================================
// ✅ GET APPROVED REVIEWS
// ================================
router.get(
  "/",
  async (req, res) => {

    const data = await getApprovedReviews();

    return successResponse({
      res,
      data
    });
  }
);


// ================================
// ✅ GET ALL REVIEWS
// ================================
router.get(
  "/admin",
  authentication(),
  async (req, res) => {

    const data = await getAllReviews();

    return successResponse({
      res,
      data
    });
  }
);


// ================================
// ✅ APPROVE REVIEW
// ================================
router.patch(
  "/:reviewId/approve",
  authentication(),
  async (req, res) => {

    const data = await approveReview(
      req.params.reviewId
    );

    return successResponse({
      res,
      data
    });
  }
);


// ================================
// ✅ DELETE REVIEW
// ================================
router.delete(
  "/:reviewId",
  authentication(),
  async (req, res) => {

    const data = await deleteReview(
      req.params.reviewId
    );

    return successResponse({
      res,
      data
    });
  }
);

export default router;