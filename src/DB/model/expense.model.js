import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    title: String, // "راتب سكرتارية" أو "كهرباء"
    amount: Number,
    type: { type: String, enum: ['salary', 'expense'] },
    date: { type: Date, default: Date.now }
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'expense'
});

const expenseModel = mongoose.models.Appointment || mongoose.model('expense', expenseSchema);