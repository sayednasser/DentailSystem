

import { redisClient } from "../../DB/Connection.redis.js";
// import { emailEnum } from "../utils/email/email.enum.js";
export const revokeTokenBaseKey = (userId) => {
    return `RevokeToken::${userId.toString()}::`
}
export const revokeTokenKey = ({ userId, jti } = {}) => {
    return `${revokeTokenBaseKey(userId)}${jti}`
}
export const otpKey = ({ email, subject = emailEnum.confirmEmail }) => {
    return `Otp::User::${email}::${subject}`
}
export const maxAttemptOtpKey = ({ email, subject = emailEnum.confirmEmail}) => {
    return `${otpKey({ email, subject })}::maxTrial`
}
export const blockOtpKey = ({ email, subject =emailEnum.confirmEmail }) => {
    return `${otpKey({ email, subject})}::blocked otp`
} 
export const login = ({ email, password}) => {
    return `Email::${email}::${password}`
}
export const maxLoginAttempt = ({ email, password}) => {
    return `${login({ email, password })}::maxTrial login`
}
export const blockLogin = ({ email, password }) => {
    return `${login({ email, password})}::blocked login`
}
export const set = async ({
    key, value, ttl,
} = {}) => {
    try {
        let data = typeof value == "string" ? value : JSON.stringify(value)
        return ttl ? await redisClient.set(key, data, { EX: ttl }) : await redisClient.set(key, data)
    } catch (error) {
        console.log(`fail to set this operation`, error);

    }
}
export const get = async (key) => {
    try {
        let data = await redisClient.get(key)
        try {
            return JSON.parse(data)
        } catch (error) {
            return data

        }

    } catch (error) {
        console.log(`fail to get this operation`);

    }
}
export const updata = async ({
    key, value, ttl,
} = {}) => {
    try {
        if (!await redisClient.EXISTS(key)) {
            return 0;
        }
        return set({ key, value, ttl })
    } catch (error) {
        console.log(`fail to updata this operation`);

    }
}
export const deleteKey = async (keys=[]) => {
    try {
        return await redisClient.del(...keys)
    } catch (error) {
        console.log(`fail to set this operation`);
    }
}
export const expires = async ({ key, tll } = {}) => {
    try {
        const result = await redisClient.expire(key, ttl)
        return result === 1;
    } catch (error) {
        console.log(`Redis Expires error`);
        return false; z

    }
}
export const ttl = async (key) => {
    try {
        return await redisClient.ttl(key)
    } catch (error) {
        console.log(`Redis ttl error:`);

    }
}
export const keys = async (key) => {
    try {
        return await redisClient.keys(`${key}*`)
    } catch (error) {
        console.log(`Redis keys error:`);
        return -2

    }
}
export const MGET = async (keys = []) => {
    try {
        if (!keys.length) {
            return 0
        }
        return await redisClient.mGet(keys)
    } catch (error) {
        console.log(`Redis MGetKeys error:`);
        return -2

    }
}
export const incr = async (keys) => {
    try {

        return await redisClient.incr(keys)
    } catch (error) {
        console.log(`Redis incr error:`);
    }
}