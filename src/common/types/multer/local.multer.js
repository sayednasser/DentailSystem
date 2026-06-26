import multer from "multer"
import { randomUUID } from "crypto"
import { resolve } from "node:path"
import { existsSync, mkdirSync } from "node:fs"
import { fileFilter } from "./multer.validation.js"


export const localUpload = ({ customPath = 'general', validation , size = 5 } = {}) => {

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            let fullPath = resolve(`../uploads/${customPath}`)
            if (!existsSync(fullPath)) {
                mkdirSync(fullPath, { recursive: true })

            }
            cb(null, fullPath)
        },
        filename: (req, file, cb) => {
            const uniqueFileName = randomUUId() + "_" + file.originalname
            file.finalPath = `../uploads/${customPath}/${uniqueFileName}`
            cb(null, uniqueFileName)
        }
    })

   return multer({fileFilter:fileFilter(validation), storage: storage ,limits:{fileSize:size*1024*1024}})

}

