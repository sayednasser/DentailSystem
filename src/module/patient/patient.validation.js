import joi from "joi";
import { generalValidationFields } from "../../common/validation.js";
import Joi from "joi";

export const addPatient = {
    body: joi.object().keys({
        fullName: joi.string().required(),
        address: joi.string().required(),
        phone: generalValidationFields.phone.optional().allow(''),
        age: joi.number().optional().allow(''),
        notes: joi.string(),
        gender: joi.string().required(),
        totalCost: joi.number().required(),
        costPaid: joi.number().required(),
        doctorId: joi.string().required(),
        visitDate: joi.date().required()

    })
}
export const updatePatient = {
    body: joi.object().keys({
        fullName: joi.string(),
        address: joi.string(),
        phone: generalValidationFields.phone,
        age: joi.number(),
        notes: joi.string(),
        gender: joi.string(),
        totalCost: joi.number(),
        costPaid: joi.number(),
        doctorId: joi.string(),
        visitDate: joi.date(),


    })
}
export const updateDiagnosis = {
    body: joi.object().keys({
        diagnosis: joi.string(),
        treatment: joi.string(),
        

    })
}