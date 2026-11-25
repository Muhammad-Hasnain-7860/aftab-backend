import multer, { memoryStorage } from "multer";

const upload = multer({
  storage: memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024,
    files: 2,
  },
  fileFilter: (req, file, cb) => {
    const isAudio = file.fieldname === "audio" && file.mimetype.startsWith("audio/");
    const isImage =
      ["image", "thumbnail"].includes(file.fieldname) &&
      file.mimetype.startsWith("image/");

    if (isAudio || isImage) {
      cb(null, true);
    } else {
      cb(new Error("Upload an audio file or image file"), false);
    }
  },
});

export default upload;
