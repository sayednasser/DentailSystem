import joi from "joi"
import { generalValidationFields } from "../../common/validation.js"
import { filedValidation } from "../../common/types/multer/multer.validation.js"

export const shareProfile = {
    params: joi.object().keys({
        userId: generalValidationFields.id.required()
    }).required()
}
export const profileImage = {
    file: generalValidationFields.file(filedValidation.image).required()
}
export const profileCoverImage = {
    file: generalValidationFields.file(filedValidation.image).required()
}
export const profileAttachment = {
    files: joi.object().keys({
        coverImage: joi.array().items(generalValidationFields.file(filedValidation.image).required()).min(1).required(),
        profileImage: joi.array().ordered(generalValidationFields.file(filedValidation.image).required()).length(1).required()
    }).required()
}
export const updatePassword = {
    body: joi.object().keys({
        oldPassword: generalValidationFields.password.required(),
        password: generalValidationFields.password.not(joi.ref("oldPassword")).required(),
        confirmPassword: generalValidationFields.confirmPassword.required(),
      }).required()
}