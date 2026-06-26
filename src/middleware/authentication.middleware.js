import { BadRequestException, decodedToken, ErrorException, RoleEnum, TokenTypeEnum, UnauthorizedException } from "../common/index.js"
import { endpoint } from "../module/patient/patient.authorization.js";


export const authentication = (tokenType = TokenTypeEnum.access) => {
  return async (req, res, next) => {
    if (!req?.headers?.authorization) {
      throw ErrorException({ message: "Missing authorization key" })
    }
    const { authorization } = req.headers
    const [flag, credentials] = authorization.split(" ")
    if (!flag || !credentials) {
      throw ErrorException({ message: "Missing authorization key" })
    }
    switch (flag) {
      case 'Basic':
        const data = Buffer.from(credentials, 'base64').toString()
        const [username, password] = data.split(":")
        break;
      case 'Bearer':
        const { user, decode } = await decodedToken({ token: credentials, tokenType })
        req.user = user;
        req.decode = decode; 

        break;
      default:
        break;
    }
    next()
  }
}
export const authorization = (accessRole = []) => {
  return async (req, res, next) => {

 

    if (!Array.isArray(accessRole) || accessRole.length === 0) {
      throw ErrorException({
        message: "Authorization roles not configured"
      })
    }

    if (!accessRole.includes(req.user.role)) {


      throw ErrorException({ message: "not allowed account" })
    }

    next()
  }
}