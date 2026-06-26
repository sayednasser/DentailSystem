import mongoose from "mongoose";
import { DB_URI } from "../../config/config.js";


export const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI,{serverSelectionTimeoutMS:10000});
        console.log("Database connected successfully✔😎");
    } catch (error) {

        console.log("failed to connect DB❌😒",error);
    }
}