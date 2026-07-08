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


export const updateWorkingHoursValidation = {
  body: joi.object({
    workingHours: joi.array()
      .items(
        joi.object({
          day: joi.string()
            .valid(
              "Saturday",
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday"
            )
            .required(),

          startTime: joi.string()
            .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
            .required()
            .messages({
              "string.pattern.base":
                "startTime must be in HH:mm format",
            }),

          endTime: joi.string()
            .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
            .required()
            .messages({
              "string.pattern.base":
                "endTime must be in HH:mm format",
            }),

          slotDuration: joi.number()
            .integer()
            .min(5)
            .max(180)
            .default(30),

          isActive: joi.boolean().default(true),
        })
      )
      .min(1)
      .required(),
  }),
};