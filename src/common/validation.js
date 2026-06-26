import joi from "joi"
import { Types } from "mongoose"
export const generalValidationFields = {
        email: joi.string().email({ minDomainSegments: 2, maxDomainSegments: 3, tlds: { allow: ['com', 'net', 'edu'] } }),
        password: joi.string().pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).{8,16}$/),
        confirmPassword: joi.string().required().valid(joi.ref("password")),
        userName: joi.string().pattern(new RegExp(/^([A-Za-z]{2,25}|[\u0600-\u06FF]{2,25})\s([A-Za-z]{2,25}|[\u0600-\u06FF]{2,25})$/)),
        otp: joi.string().pattern(new RegExp(/^\d{6}$/)),
        phone: joi.string().pattern(new RegExp(/^(02|2|\+2)?01[0-25]\d{8}$/)),
        role: joi.number(),
        age: joi.number().integer().min(1).max(120),
        FCM:joi.string(),
        id: joi.string().custom((value, helper) => {
                return Types.ObjectId.isValid(value) ? true : helper.message('invalid ObjectId')
        }),
        file: function (mimetype = []) {
                return joi.object().keys({
                        fieldname: joi.string(),
                        originalname: joi.string(),
                        encoding: joi.string(),
                        mimetype: joi.string().valid(...mimetype),
                        // finalPath: joi.string().required(),
                        destination: joi.string(),
                        filename: joi.string(),
                        path: joi.string(),
                        size: joi.number().positive()
                })
        }
}


