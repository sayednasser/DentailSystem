export const filedValidation = {
    image: ['image/jpeg', 'image/png'],
    video: ['video/mp4', 'video/mp3', 'video/mkv', 'video/avi'],
    audio: ['audio/wav', 'audio/mpeg', 'audio/ogg'],
    pdf: ['application/pdf']
}

export const fileFilter = (validation = []) => {
    return (req, file, cb) => {
        console.log("FILE IN FILTER:", file);
        console.log("FIELD:", file.fieldname);
        console.log("MIME:", file.mimetype);
        console.log("ALLOWED:", validation);


        const allowedTypes = validation.map(v => v.toLowerCase());
        if (!allowedTypes.includes(file.mimetype.toLowerCase())) {
            return cb(new Error("invalid file format", { cause: { status: 400 } }), false);
        }
        cb(null, true)

    }
}