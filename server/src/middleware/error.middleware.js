import multer from "multer";
import { apiResponse } from "../utils/api.utils.js";

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return apiResponse(
      res,
      400,
      false,
      err.code === "LIMIT_FILE_SIZE"
        ? "File size must not exceed 30 MB"
        : err.message
    );
  }

  if (err) {
    return apiResponse(
      res,
      400,
      false,
      err.message || "File upload failed"
    );
  }

  next();
};

export default multerErrorHandler;