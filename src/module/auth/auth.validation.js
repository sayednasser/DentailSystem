import { generalValidationFields } from "../../common/validation.js";
import joi from "joi";


export const login = {
    body: joi.object().keys({
        email: generalValidationFields.email.required(),
        password: generalValidationFields.password.required(),
        FCM: generalValidationFields.FCM

    }).required()
}


export const ResendConfirmEmail = {
    body: joi.object().keys({
        email: generalValidationFields.email.required(),
    })
}
export const resendConfirmEmail = {
    body: joi.object().keys({
        email: generalValidationFields.email.required()
    })
}
export const ConfirmEmail = {
    body: ResendConfirmEmail.body.append({
        code: generalValidationFields.otp.required()
    })
}

export const resatForgotPassword = {
    body: ConfirmEmail.body.append({
        password: generalValidationFields.password.required(),
        confirmPassword: generalValidationFields.confirmPassword.required()

    })
}