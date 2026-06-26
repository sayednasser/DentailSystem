import { hash ,compare} from "bcrypt"
import { SALT_ROUND } from "../../../config/config.js"

export const hashPassword = async({plainText,salt=SALT_ROUND}={}) =>{
    return await hash(plainText,salt)
}
export const comparePassword =async ({plainText,hashText})=>{
    return await compare (plainText,hashText)
}