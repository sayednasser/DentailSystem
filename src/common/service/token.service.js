import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { ACCESS_EXPIRES_IN, REFRESH_EXPIRES_IN, SYSTEM_ACCESS_TOKEN_KEY, SYSTEM_REFRESH_TOKEN_KEY, USER_REFRESH_TOKEN_KEY, USER_TOKEN_SECRET_KEY } from "../../../config/config.js";
import { AudienceEnum, RoleEnum, TokenTypeEnum } from "../Enum/index.js";
import { redisClient } from "../../DB/Connection.redis.js";
import { get, revokeTokenKey } from "./redis.service.js";
import { ErrorException, ForbiddenException ,NotFoundException} from "../application/error.response.js";
import { userModel } from "../../DB/model/user.model.js";

export const generateToken = ({ payload = {}, secret = USER_TOKEN_SECRET_KEY, options = {} } = {}) => {
    return jwt.sign(payload, secret, options);
};
export const verifyToken = async ({
    token,
    secret = USER_TOKEN_SECRET_KEY,
} = {}) => {
    return jwt.verify(token, secret);
};

export const getTokenSignature = async (role) => {
    let accessSignature = undefined;
    let refreshSignature = undefined;
    let audience = AudienceEnum.User;

    switch (role) {
        case RoleEnum.Admin:
            accessSignature = SYSTEM_ACCESS_TOKEN_KEY;
            refreshSignature = SYSTEM_REFRESH_TOKEN_KEY;
            audience = AudienceEnum.System;

            break;

        default:
            accessSignature = USER_TOKEN_SECRET_KEY;
            refreshSignature = USER_REFRESH_TOKEN_KEY;
            audience = AudienceEnum.User;

            break;
    }


    return {
        accessSignature,
        refreshSignature,
        audience
    }

}

export const createLoginCredentials = async (user, issuer) => {

    const { accessSignature, refreshSignature, audience } = await getTokenSignature(user.role)
    const jwtId = randomUUID()
    const accessToken = await generateToken({
        payload: { sub: user._id.toString() },
        secret: accessSignature,
        options: {
            expiresIn: ACCESS_EXPIRES_IN,
            issuer: issuer,
            audience: [TokenTypeEnum.access, audience.toString()],
            jwtid: jwtId

        }
    })
    const RefreshToken = await generateToken({
        payload: { sub: user._id.toString() },
        secret: refreshSignature,
        options: {
            expiresIn: REFRESH_EXPIRES_IN,
            issuer: issuer,
            audience: [TokenTypeEnum.refresh, audience.toString()],
            jwtid: jwtId

        }
    })
    return {
        accessToken,
        RefreshToken
    }


}


export const getSignatureLevel = async (audienceType) => {
    const type = Number(audienceType);

    switch (type) {
        case AudienceEnum.System:
            return RoleEnum.Admin; 

        case RoleEnum.Doctor:
        case RoleEnum.reception:
            return RoleEnum.Doctor;

        default:
            return RoleEnum.Doctor;
    }
}

export const decodedToken = async ({ token, tokenType = TokenTypeEnum.access } = {}) => {
    const decode = jwt.decode(token);

    if (!decode?.aud?.length) {
        throw ErrorException({ message: "fail to decoded this token and decode is required " });
    }
    if (decode.jti && await get(revokeTokenKey({ userId: decode.sub, jti: decode.jti }))) {
        throw UnauthorizedException({ message: "invalid login session" })
    }
    const [decodeTokenType, audienceType] = decode.aud;
    if (decodeTokenType !== tokenType) {
        throw ErrorException({ message: `Invalid token type token of type ${decodeTokenType} cannot access this api we expected token typeof ${tokenType} ` })
    }
    const signatureLevel = await getSignatureLevel(audienceType);
    const numericAudienceType = Number(audienceType);
    const { accessSignature, refreshSignature } =
        await getTokenSignature(numericAudienceType);
   
    const verifyData = await verifyToken({
        token,
        secret: tokenType == TokenTypeEnum.refresh ? refreshSignature : accessSignature,
    });

    const user = await userModel.findById({
        _id: verifyData.sub,
    });
    if (!user) {
        throw NotFoundException({ message: "user not found  you must signup" });
    }

    if (user.changeCredentialTime && user.changeCredentialTime?.getTime() >= decode.iat * 1000) {
        throw UnauthorizedException({ message: "invalid login session" })
    }
    return { user, decode };

};