import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor' },
    totalCost: Number,    
    doctorPercentage: Number, 
    createdAt: { type: Date, default: Date.now }
},{
    timestamps: true,
    strict: true,
    strictQuery: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'Appointment'
}); 

const AppointmentModel = mongoose.models.Appointment||mongoose.model('Appointment', appointmentSchema);