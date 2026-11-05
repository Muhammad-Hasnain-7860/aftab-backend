import multer, { memoryStorage } from "multer";

const upload = multer({
    storage: memoryStorage(),
    limits: {
        fileSize: 200 * 1024 * 1024,
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype.startsWith("video/") ||
            file.mimetype.startsWith("audio/")
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only video and audio files are allowed!"), false);
        }
    },
});

export default upload;
