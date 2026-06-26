import { BadRequestException } from "../common/index.js";

export const validation = (schema) => {
    return (req, res, next) => {

        const keys = Object.keys(schema) || []
        const errors = []
        for (const key of keys) {
            const validResult = schema[key].validate(req[key], { abortEarly: false })
            if (validResult.error) {
                errors.push({ key, details: validResult.error.details?.map(ele => { return { message: ele.message, path:ele.path } }) })
            }
        }
        if (errors.length) {
            throw BadRequestException({ message: "validation errors", extra: { errors } })
        }
        next()

    }


}