import cloudinary from "../types/multer/cloudinary.js"


export const uploadFile =async ({ FilePath, folder } = {}) => {
    return await cloudinary.uploader.upload(FilePath, { folder })
}

export const deleteFile = async( public_id ) => {
    return await cloudinary.uploader.destroy(public_id)

}
export const uploadFiles =async ({ files = [], folder } = {}) => {
    let attachments = []
    for (const file of files) {
        const { public_id,secure_url } = await uploadFile({ FilePath: file.path, folder });
        attachments.push({ public_id,secure_url });
    }
    return attachments
}

export const deleteFiles =async (public_ids) => {
    return await cloudinary.api.delete_resources(public_ids)

}

