import { Router } from "express";
import {  login, requestForgotPassword, resatForgotPasswordCode,  verifyForgotPassword } from "./auth.service.js";
import { successResponse } from "../../common/index.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from"./auth.validation.js"
import { authentication } from "../../middleware/authentication.middleware.js";
const router = Router();


router.post("/login",validation(validators.login), async (req, res) => {
    const data= await login(req.body,`${req.protocol}://${req.host}`)
    return successResponse({ res,status:200,data });
});
router.patch("/forgot-password", validation(validators.resendConfirmEmail), async (req, res, next) => {
  const user = await requestForgotPassword(req.body)
  return successResponse({ res, data: user });
});
router.patch("/verify-forgot-password", validation(validators.ConfirmEmail), async (req, res, next) => {
  const user = await verifyForgotPassword(req.body)
  return successResponse({ res, data: user });
});
router.patch("/reset-forgot-password", validation(validators.resatForgotPassword), async (req, res, next) => {
  const user = await resatForgotPasswordCode(req.body)
  return successResponse({ res, data: user });
});



export default router;