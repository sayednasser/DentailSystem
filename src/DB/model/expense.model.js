import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({

    title: String,
    category: {
        type: String,
        required: true,
    },        
    description: String,  
    amount: Number,
    type: {
        type: String,
        enum: ["salary", "expense"]
    },
    date: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}
    , {
        timestamps: true,
        strict: true,
        strictQuery: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        collection: 'expense'
    });

export const expenseModel = mongoose.models.expense || mongoose.model('expense', expenseSchema);