import {
  doctorModel, patientModel,
  AppointmentModel
} from "../../DB/model/index.js";
import {
  NotFoundException, ConflictException,
  BadRequestException,
  AppointmentStatus,
} from "../../common/index.js";
import {
  generateTimeSlots,
  getDayName,
  timeToMinutes,
  minutesToTime,
} from "../../common/index.js";

export const getAvailableSlots = async (doctorId, date) => {

  // Normalize doctorId (string or object)
  const id =
    typeof doctorId === "string"
      ? doctorId
      : doctorId?._id?.toString();

  if (!id) {
    throw NotFoundException({
      message: "Doctor id is required",
    });
  }

  // Get doctor
  const doctor = await doctorModel.findOne({
    userId: id
  }); console.log("doctor =", doctor);

  if (!doctor) {
    throw NotFoundException({
      message: "Doctor not found",
    });
  }

  // Get day name
  const dayName = getDayName(date);

  // Find doctor's working day
  const workingDay = doctor.workingHours.find(
    (day) => day.day === dayName && day.isActive
  );

  if (!workingDay) {
    return [];
  }

  // Generate all doctor's slots
  const allSlots = generateTimeSlots({
    startTime: workingDay.startTime,
    endTime: workingDay.endTime,
    slotDuration: workingDay.slotDuration,
  });

  // Start & End of selected day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get booked appointments
  const appointments = await AppointmentModel.find({
    doctorId: id,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    status: {
      $ne: AppointmentStatus.Cancelled,
    },
  }).select("startTime");

  // Booked slots
  const bookedSlots = new Set(
    appointments.map((appointment) => appointment.startTime)
  );

  // Available slots
  const availableSlots = allSlots.filter(
    (slot) => !bookedSlots.has(slot.startTime)
  );

  return availableSlots;
};

export const createAppointment = async (inputs) => {
  const {
    doctorId,
    patientId,
    date,
    startTime,
    totalCost = 0,
  } = inputs;

  // Prevent booking in the past
  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (appointmentDate < today) {
    throw ConflictException({
      message: "Cannot book an appointment in the past",
    });
  }

  // Get doctor & patient
  const [doctor, patient] = await Promise.all([
    doctorModel.findOne({ userId: doctorId }),
    patientModel.findById(patientId),
  ]);

  if (!doctor) {
    throw NotFoundException({
      message: "Doctor not found",
    });
  }

  if (!patient) {
    throw NotFoundException({
      message: "Patient not found",
    });
  }

  // Get doctor's working day
  const dayName = getDayName(appointmentDate);

  const workingDay = doctor.workingHours.find(
    (day) => day.day === dayName && day.isActive
  );

  if (!workingDay) {
    throw ConflictException({
      message: "Doctor is not available on this day",
    });
  }

  // Generate doctor's slots
  const slots = generateTimeSlots({
    startTime: workingDay.startTime,
    endTime: workingDay.endTime,
    slotDuration: workingDay.slotDuration,
  });

  // Check requested slot exists
  const selectedSlot = slots.find(
    (slot) => slot.startTime === startTime
  );

  if (!selectedSlot) {
    throw ConflictException({
      message: "Invalid appointment time",
    });
  }

  // Get start & end of selected day
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Check if slot already booked
  const exists = await AppointmentModel.findOne({
    doctorId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    startTime,
    status: {
      $ne: AppointmentStatus.Cancelled,
    },
  });

  if (exists) {
    throw ConflictException({
      message: "Appointment already booked",
    });
  }

  // Calculate appointment end time
  const endTime = minutesToTime(
    timeToMinutes(startTime) + workingDay.slotDuration
  );

  // Create appointment
  const appointment = await AppointmentModel.create({
    doctorId,
    patientId,
    date: appointmentDate,
    startTime,
    endTime,
    totalCost,
    doctorPercentage: doctor.doctorPercentage,
  });

  // Increase patient's total cost
  if (Number(totalCost) > 0) {
    await patientModel.findByIdAndUpdate(
      patientId,
      {
        $inc: {
          totalCost: Number(totalCost),
        },
      },
      { new: true }
    );
  }

  return appointment;
};
export const getDoctorAppointments = async (doctorId, date) => {
  // Check doctor
  const doctor = await doctorModel.findOne({ userId: doctorId });

  if (!doctor) {
    throw NotFoundException({
      message: "Doctor not found",
    });
  }

  // Get start & end of selected day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get appointments
  const appointments = await AppointmentModel.find({
    doctorId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })
    .populate({
      path: "patientId",
      select: "firstName middleName lastName phone age gender",
    })
    .sort({ startTime: 1 });

  return appointments;
};
export const getMyAppointments = async (userId, date) => {
  const doctor = await doctorModel.findOne({ userId });

  if (!doctor) {
    throw NotFoundException({
      message: "Doctor not found",
    });
  }

  return getDoctorAppointments(doctor.userId, date);
};
export const updateAppointmentStatus = async (appointmentId, status) => {
  const appointment = await AppointmentModel.findById(appointmentId);

  if (!appointment) {
    throw NotFoundException({
      message: "Appointment not found",
    });
  }

  if (appointment.status === status) {
    throw BadRequestException({
      message: "Appointment already has this status",
    });
  }

  appointment.status = status;

  await appointment.save();

  return appointment;
};
export const rescheduleAppointment = async (appointmentId, inputs) => {
  const { date, startTime } = inputs;

  const appointment = await AppointmentModel.findById(appointmentId);

  if (!appointment) {
    throw NotFoundException({
      message: "Appointment not found",
    });
  }


  const doctor = await doctorModel.findOne({
    userId: appointment.doctorId
  });

  if (!doctor) {
    throw NotFoundException({
      message: "Doctor not found",
    });
  }


  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);


  const today = new Date();
  today.setHours(0, 0, 0, 0);


  if (appointmentDate < today) {
    throw ConflictException({
      message: "Cannot reschedule to a past date",
    });
  }

  console.log("appointment =", appointment)
  const dayName = getDayName(appointmentDate);


  const workingDay = doctor.workingHours.find(
    (day) =>
      day.day === dayName &&
      day.isActive
  );


  if (!workingDay) {
    throw ConflictException({
      message: "Doctor is not available on this day",
    });
  }


  const slots = generateTimeSlots({
    startTime: workingDay.startTime,
    endTime: workingDay.endTime,
    slotDuration: workingDay.slotDuration,
  });


  const selectedSlot = slots.find(
    slot => slot.startTime === startTime
  );


  if (!selectedSlot) {
    throw ConflictException({
      message: "Invalid appointment time",
    });
  }


  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);


  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);


  const exists = await AppointmentModel.findOne({
    doctorId: appointment.doctorId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    startTime,
    status: {
      $ne: "cancelled"
    }
  });


  if (exists) {
    throw ConflictException({
      message: "Appointment already booked"
    });
  }


  // إلغاء الموعد القديم
  appointment.status = "cancelled";

  await appointment.save();


  // إنشاء موعد جديد
  const newAppointment = await AppointmentModel.create({

    patientId: appointment.patientId,

    doctorId: appointment.doctorId,

    date: appointmentDate,

    startTime,

    endTime: minutesToTime(
      timeToMinutes(startTime) + workingDay.slotDuration
    ),

    totalCost: appointment.totalCost,

    doctorPercentage: appointment.doctorPercentage,

    status: "scheduled",

    bookedBy: appointment.bookedBy,

    notes: appointment.notes,

  });


  return newAppointment;
};
export const getTodayAppointments = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await AppointmentModel.find({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })
    .populate({
      path: "patientId",
      select: "firstName middleName lastName phone age gender",
    })
    .populate({
      path: "doctorId",
      select: "specialization userId",
      populate: {
        path: "userId",
        select: "firstName middleName lastName",
      },
    })
    .sort({ startTime: 1 });

  return appointments;
};
export const getPatientAppointments = async (patientId) => {
  const patient = await patientModel.findById(patientId);

  if (!patient) {
    throw NotFoundException({
      message: "Patient not found",
    });
  }

  const appointments = await AppointmentModel.find({ patientId });


  return appointments;
};