import joi from "joi";

export const updateProfile = {
  body: joi.object({
    specialization:joi.string().min(2).max(100),
    fullName:joi.string().min(2).max(100),
    bio:joi.string().min(2).max(100),
    phone: joi.string().pattern(/^[0-9]{11}$/).messages({"string.pattern.base": "Phone number must be 11 digits"}),

    clinicName: joi.string().min(2).max(100),

    workingHours: joi.string().max(100)
  }).min(1)
};