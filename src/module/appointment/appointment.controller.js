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
 *  @swagger
 * /appointment/available-slots:
 *   get:
 *     summary: Get available slots
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: doctorId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *       - name: date
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Available slots retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/available-slots", authentication(), async (req, res) => {
    console.log("doctorId =", req.query.doctorId);
    console.log("type =", typeof req.query.doctorId);
    const { doctorId, date } = req.query;

    const data = await getAvailableSlots(doctorId, date);
    return successResponse({ res, status: 200, data, });
});
/**
 * @swagger
 * /appointment:
 *   post:
 *     summary: Create an appointment
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 required: true
 *               startTime:
 *                 type: string
 *                 required: true
 *               endTime:
 *                 type: string
 *                 required: true
 *               doctorId:
 *                 type: string
 *                 required: true
 *               patientId:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       401:
 *         description: Unauthorized
 */

router.post("/", authentication(), validation(validators.createAppointmentValidation),
    async (req, res) => {
        const data = await createAppointment(req.body);
        return successResponse({ res, status: 201, data, });
    });
/**
 * @swagger
 * /appointment/doctor:
 *   get:
 *     summary: Get doctor appointments
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       401:   
 *         description: Unauthorized
 */
router.get("/doctor", authentication(), validation(validators.getDoctorAppointmentsValidation), async (req, res) => {
    const { doctorId, date } = req.query;
    const data = await getDoctorAppointments(doctorId, date);
    return successResponse({ res, status: 200, data, })
});
/**
 * @swagger
 * /appointment/my:
 *   get:
 *     summary: Get my appointments
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/my", authentication(), async (req, res) => {
    const data = await getMyAppointments(req.user._id, req.query.date);
    return successResponse({
        res,
        status: 200,
        data,
    });
});


/**
 * @swagger
 * /appointment/status/{appointmentId}:
 *   patch:
 *     summary: Update appointment status
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the appointment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: New status for the appointment (e.g., confirmed, cancelled, completed)
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Appointment status updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.patch("/status/:appointmentId", authentication(), validation(validators.updateAppointmentStatusValidation),
    async (req, res) => {
        const data = await updateAppointmentStatus(req.params.appointmentId, req.body.status);
        return successResponse({ res, status: 200, data, });
    });

/**
 * @swagger
 * /appointment/reschedule/{appointmentId}:
 *   patch:
 *     summary: Reschedule an appointment
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the appointment to reschedule
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: New date/time for the appointment
 *               reason:
 *                 type: string
 *                 description: Optional reason for rescheduling
 *     responses:
 *       200:
 *         description: Appointment rescheduled successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.patch("/reschedule/:appointmentId", authentication(), validation(validators.rescheduleAppointmentValidation), async (req, res) => {
    const data = await rescheduleAppointment(req.params.appointmentId, req.body);
    return successResponse({ res, status: 200, data, });
});

/**
 * @swagger
 * /appointment/today:
 *   get:
 *     summary: Get today's appointments
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointments not found
 * 
 */
router.get("/today", authentication(), async (req, res) => {
    const data = await getTodayAppointments();
    return successResponse({ res, status: 200, data, });
});

/**
 * @swagger
 * /appointment/patient/{patientId}:
 *   get:
 *     summary: Get appointments for a patient
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the patient
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointments not found
 */
router.get("/patient/:patientId", authentication(), validation(validators.getPatientAppointmentsValidation), async (req, res) => {
    const data = await getPatientAppointments(req.params.patientId);
    return successResponse({ res, status: 200, data, });
});

export default router;