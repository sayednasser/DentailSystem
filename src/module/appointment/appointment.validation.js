import joi from "joi";
import { generalValidationFields } from "../../common/validation.js";

export const createAppointmentValidation = {
    body: joi.object({
        doctorId: generalValidationFields.id.required(),

        patientId: generalValidationFields.id.required(),

        date: joi.date().required(),

        startTime: joi
            .string()
            .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
            .required()
            .messages({
                "string.pattern.base": "startTime must be in HH:mm format",
            }),

        totalCost: joi.number().min(0).default(0),
    }),
};
export const getDoctorAppointmentsValidation = {
    query: joi.object({
        doctorId: generalValidationFields.id.required(),

        date: joi.date().required(),
    }),
};

export const updateAppointmentStatusValidation = {
  params: joi.object({
    appointmentId: generalValidationFields.id.required(),
  }),

  body: joi.object({
    status: joi.string()
      .valid("scheduled", "completed", "cancelled", "no-show")
      .required(),
  }),
};

export const rescheduleAppointmentValidation = {
  params: joi.object({
    appointmentId: generalValidationFields.id.required(),
  }),

  body: joi.object({
    date: joi.date().required(),

    startTime: joi
      .string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
  }),
};

export const getPatientAppointmentsValidation = {
  params: joi.object({
    patientId: generalValidationFields.id.required(),
  }),
};