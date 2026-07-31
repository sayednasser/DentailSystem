import { Router } from "express";
import {  login, requestForgotPassword, resatForgotPasswordCode,  verifyForgotPassword } from "./auth.service.js";
import { successResponse } from "../../common/index.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from"./auth.validation.js"
import { authentication } from "../../middleware/authentication.middleware.js";
const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successfully
 */
router.post("/login",validation(validators.login), async (req, res) => {
    const data= await login(req.body,`${req.protocol}://${req.host}`)
    return successResponse({ res,status:200,data });
});
/**
 * @swagger
 * /auth/forgot-password:
 *   patch:
 *     summary: Forgot password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Forgot password successfully
 */
router.patch("/forgot-password", validation(validators.resendConfirmEmail), async (req, res, next) => {
  const user = await requestForgotPassword(req.body)
  return successResponse({ res, data: user });
});
/**
 * @swagger
 * /auth/verify-forgot-password:
 *   patch:
 *     summary: Verify forgot password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verify forgot password successfully
 */
router.patch("/verify-forgot-password", validation(validators.ConfirmEmail), async (req, res, next) => {
  const user = await verifyForgotPassword(req.body)
  return successResponse({ res, data: user });
});
/**
 * @swagger
 * /auth/reset-forgot-password:
 *   patch:
 *     summary: Reset forgot password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset forgot password successfully
 */
router.patch("/reset-forgot-password", validation(validators.resatForgotPassword), async (req, res, next) => {
  const user = await resatForgotPasswordCode(req.body)
  return successResponse({ res, data: user });
});



export default router;