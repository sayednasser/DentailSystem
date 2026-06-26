import { CLIENT_ID } from "../../../config/config.js";
import { blockLogin, blockOtpKey, comparePassword, ConflictException, createLoginCredentials, deleteKey, emailEnum, encrypt, ErrorException, ForbiddenException, get, hashPassword, incr, keys, maxAttemptOtpKey, maxLoginAttempt, NotFoundException, otpKey, ProviderEnum, revokeTokenBaseKey, set, ttl } from "../../common/index.js";
import { emailEvent } from "../../common/types/email/event.email.js";
import { sendEmail } from "../../common/types/email/sendEmail.js";
import { createTemplateOtp, emailTemplate } from "../../common/types/email/templateEmail.js";
import { userModel } from "../../DB/model/index.js";

const sendOtpEmail = async ({ email, subject, title } = {}) => {
    const isBlocked = await ttl(blockOtpKey({ email, subject, }))
    if (isBlocked > 0) {
        throw ConflictException({ message: `Sorry we cannot send new otp before you wait ${isBlocked}` })
    }
    const resendingTime = await ttl(otpKey({ email, subject, }))
    if (resendingTime > 0) {
        throw ConflictException({ message: `Sorry we cannot send new otp  until exist otp expire ${resendingTime}` })
    }
    const maxTrial = await get(maxAttemptOtpKey({ email, subject }))
    if (maxTrial >= 3) {
        await set({ key: blockOtpKey({ email, subject }), value: 1, ttl: 420 })
        throw ErrorException({ message: "yau reached to max place wait " })
    }
    const code = await createTemplateOtp();
    console.log(code);
    await set({ key: otpKey({ email, subject }), value: await hashPassword({ plainText: `${code}` }), ttl: 300 })

    emailEvent.emit("sendEmail", async () => {

        await sendEmail({
            to: email,
            subject,
            html: await emailTemplate({ code, title })
        })
        await incr(maxAttemptOtpKey({ email, subject }))
    })
}

export const login = async (inputs, issuer) => {
    const { email, password } = inputs
    const user = await userModel.findOne({ email})
    if (!user) {
        throw NotFoundException("User not found")
    }
    const isBlocked = await ttl(blockLogin({ email }))
    if (isBlocked > 0) {
        throw ConflictException({
            message: `Try again later after ${isBlocked} seconds`
        });
    }
    const result = await comparePassword({ plainText: password, hashText: user.password })
    console.log({ result });

    if (!result) {
        const maxTrials = await incr(maxLoginAttempt({ email }))
        if (maxTrials >= 5) {
            await set({
                key: blockLogin({ email }),
                value: 1,
                ttl: 300
            })
        }
        throw NotFoundException({ message: "invalid login data" });
    }
    return createLoginCredentials(user, issuer)
}



export const requestForgotPassword = async (inputs) => {

    const { email } = inputs;

    const account = await userModel.findOne({ email,  provider: ProviderEnum.System })

    if (!account) {
        throw NotFoundException({ message: "email is not found" })
    }
    await sendOtpEmail({ email, subject: emailEnum.forgotPassword, title: "Rest login code" })
    return;

};
export const verifyForgotPassword = async (inputs) => {

    const { email, otp } = inputs;
    const hashOtp = await get(otpKey({ email, subject: emailEnum.forgotPassword }))
    if (!hashOtp) {
        throw NotFoundException({ message: "Expired Otp" })
    }
    if (!await comparePassword({ plainText: otp, hashText: hashOtp })) {
        throw ConflictException({ message: "invalid otp" })
    }
    return;

};
export const resatForgotPasswordCode = async (inputs) => {

    const { email, otp, password } = inputs;

    await verifyForgotPassword({ email, otp })
    const user = await userModel.findOne({ email, confirmEmail: { $exists: true }, provider: ProviderEnum.System })
    if (!user) {
        throw NotFoundException({ message: "account not found " })
    }
    const result = await userModel.updateOne({ _id: user._id }, { password: await hashPassword({ plainText: password }), changeCredentialTime: new Date() })
    console.log({ result });
    const tokenKeys = await keys(revokeTokenBaseKey(user._id))
    const otpKeys = await keys(otpKey({ email, subject: emailEnum.forgotPassword }))
    user.changeCredentialTime = new Date();
    await deleteKey([...tokenKeys, ...otpKeys])
    return;
};


