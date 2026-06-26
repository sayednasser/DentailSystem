import joi from "joi";
import { generalValidationFields } from "../../common/validation.js";

export const createDoctor = {
    body: joi.object().keys({
        fullName: generalValidationFields.userName.required(),
        phone: generalValidationFields.phone.required(),
        specialization: joi.string().required(),
        role: generalValidationFields.role.required(),
        age: generalValidationFields.age.required(),
        email:generalValidationFields.email.required(),
        password:generalValidationFields.password.required()

    }),
    params: joi.object().keys({}),
}
export const createReception = {
    body: joi.object().keys({
        fullName: generalValidationFields.userName.required(),
        phone: generalValidationFields.phone,
        role: generalValidationFields.role.required(),
        age: generalValidationFields.age,
        email:generalValidationFields.email.required(),
        password:generalValidationFields.password.required()

    }),
    params: joi.object().keys({}),
}