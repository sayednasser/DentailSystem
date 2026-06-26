import express from "express";
import { adminRouter, authRouter, doctorRouter, patientRouter, userRouter } from "./module/index.js"
import { PORT } from "../config/config.js";
import { GlobalErrorHandler } from "./middleware/index.js";
import { connectDB } from "./DB/Connection.DB.js";
import { connectRedis } from "./DB/Connection.redis.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";


const app = express();


export const bootstrap = async () => {



    await connectDB();
    await connectRedis();


    // CORS Options
    const corsOptions = {
        origin: process.env.ORIGIN
            ? process.env.ORIGIN.split(",")
            : "*",
        optionsSuccessStatus: 200,
        credentials: true
    };

    // Rate Limiter
    const limiter = rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 1000,
        message:
            "Too many requests from this IP, please try again after 5 minutes",
        legacyHeaders: true,
        standardHeaders: "draft-8",
    });

    app.set("trust proxy", 1);

    app.use(cors(corsOptions));
    app.use(helmet());
    app.use(limiter);
    app.use(express.json());
    app.use("/user", userRouter);
    app.use("/auth", authRouter);
    app.use("/patient", patientRouter)
    app.use("/doctor", doctorRouter)
    app.use("/admin", adminRouter)
    app.get("/", (req, res) => {
        res.status(200).json("Hello world");
    })
 
    app.get("/", (req, res) => {
        res.json({ message: "API Running" });
    });

    app.all("{/*dummy}", (req, res) => {
        res.status(404).json("Route not found");
    })
    app.use((GlobalErrorHandler))

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
} 