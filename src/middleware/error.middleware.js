import fs from "node:fs";
import { NODE_ENV } from "../../config/config.js";
export const GlobalErrorHandler = (err, req, res, next) => {
    const status = err.cause?.status ?? 500;
    const message = err.message || "Something went wrong";
    const Mood = NODE_ENV == 'production';
    if (req.file) {
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    }
    if (Array.isArray(req.file)) {
        req.file.forEach(file => {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });
    }
    return res.status(status).json(
        {
            statusCode: status,
            message: message,
            Cause: err.cause,
            stack: Mood ? undefined : err.stack

        })
};