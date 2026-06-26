import { config } from "dotenv";
import { resolve } from "node:path";
export const NODE_ENV = process.env.NODE_ENV || "development";
const envPath = {

    development: ".env.development",
    production: ".env.production",
    admin: ".env.admin"

}
config({ path: resolve(`./config/${envPath[NODE_ENV]}`) });

export const PORT = process.env.PORT || 4000
export const DB_URI = process.env.DB_URI

export const ORIGIN = process.env.ORIGIN 
export const USER_TOKEN_SECRET_KEY = process.env.USER_ACCESS_TOKEN_KEY 
export const USER_REFRESH_TOKEN_KEY = process.env.USER_REFRESH_TOKEN_KEY

export const SYSTEM_ACCESS_TOKEN_KEY = process.env.SYSTEM_ACCESS_TOKEN_KEY
export const SYSTEM_REFRESH_TOKEN_KEY = process.env.SYSTEM_REFRESH_TOKEN_KEY

export const ACCESS_EXPIRES_IN=process.env.ACCESS_EXPIRES_IN
export const REFRESH_EXPIRES_IN=process.env.REFRESH_EXPIRES_IN

export const SALT_ROUND=Number(process.env.SALT_ROUND)

export const ENCRYPTION_SECRET_KEY=process.env.ENCRYPTION_SECRET_KEY

export const REDIS_URI=process.env.REDIS_URI
export const EMAIL_APP_PASSWORD=process.env.EMAIL_APP_PASSWORD
export const EMAIL_APP=process.env.EMAIL_APP


export const YOUTUBE=process.env.YOUTUBE
export const INSTAGRAM=process.env.INSTAGRAM
export const FACEBOOK=process.env.FACEBOOK

export const CLOUD_NAME=process.env.CLOUD_NAME
export const API_KEY=process.env.API_KEY
export const API_SECRET=process.env.API_SECRET
export const APPLICATION_NAME=process.env.APPLICATION_NAME

export const CLIENT_ID=process.env.CLIENT_ID

