import nodemailer from "nodemailer";
import { EMAIL_APP, EMAIL_APP_PASSWORD } from "../../../../config/config.js";



export const sendEmail = async ({
    cc,
    to,
    bcc,
    subject,
    html,
    attachments = [] } = {}) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_APP,
            pass: EMAIL_APP_PASSWORD,
        },
    });
    (async () => {
        const info = await transporter.sendMail({

            to,
            cc,
            bcc,
            html,
            subject,
            attachments,
            from: `Chat App ${EMAIL_APP}`,

        });
        console.log("Message sent:", info.messageId);

    })();
}
