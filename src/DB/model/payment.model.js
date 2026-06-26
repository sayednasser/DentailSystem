import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    amountPaid: Number,  
    date: { type: Date, default: Date.now }
},{
    timestamps: true,
    strict: true,
    strictQuery: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'payment'
});

const paymentModel = mongoose.models.payment||mongoose.model('payment', paymentSchema)