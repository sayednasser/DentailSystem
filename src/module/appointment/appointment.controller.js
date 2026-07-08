import { Router } from "express";
import { successResponse } from "../../common/index.js";
import {
    createAppointment,
    getAvailableSlots,
    getDoctorAppointments,
    getMyAppointments,
    getPatientAppointments,
    getTodayAppointments,
    rescheduleAppointment,
    updateAppointmentStatus,
} from "./appointment.service.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./appointment.validation.js";


const router = Router();

/**
 * Get Available Appointment Slots
 */
router.get("/available-slots", authentication(), async (req, res) => {
    console.log("doctorId =", req.query.doctorId);
    console.log("type =", typeof req.query.doctorId);
    const { doctorId, date } = req.query;

    const data = await getAvailableSlots(doctorId, date);
    return successResponse({ res, status: 200, data, });
});

router.post("/", authentication(), validation(validators.createAppointmentValidation),
    async (req, res) => {
        const data = await createAppointment(req.body);
        return successResponse({ res, status: 201, data, });
    });

router.get("/doctor", authentication(), validation(validators.getDoctorAppointmentsValidation), async (req, res) => {
    const { doctorId, date } = req.query;
    const data = await getDoctorAppointments(doctorId, date);
    return successResponse({ res, status: 200, data, })
});

// مواعيد الدكتور نفسه (بيستخدم التوكن بتاعه — مفيش حاجة بتتبعت من الفرونت)
router.get("/my", authentication(), async (req, res) => {
    const data = await getMyAppointments(req.user._id, req.query.date);

    return successResponse({
        res,
        status: 200,
        data,
    });
});

router.patch("/status/:appointmentId", authentication(), validation(validators.updateAppointmentStatusValidation),
    async (req, res) => {
        const data = await updateAppointmentStatus(req.params.appointmentId, req.body.status);
        return successResponse({ res, status: 200, data, });
    });

router.patch("/reschedule/:appointmentId", authentication(), validation(validators.rescheduleAppointmentValidation), async (req, res) => {
    const data = await rescheduleAppointment(req.params.appointmentId, req.body);
    return successResponse({ res, status: 200, data, });
});

router.get("/today", authentication(), async (req, res) => {
    const data = await getTodayAppointments();
    return successResponse({ res, status: 200, data, });
});

router.get("/patient/:patientId", authentication(), validation(validators.getPatientAppointmentsValidation), async (req, res) => {
    const data = await getPatientAppointments(req.params.patientId);
    return successResponse({ res, status: 200, data, });
});

export default router;