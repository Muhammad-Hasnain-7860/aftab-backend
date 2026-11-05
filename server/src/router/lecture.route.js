import { Router } from "express";
// import upload from "../config/multer.js";
import {
  completeVideo,
  createVideo,
  uploadAuth,
  checkActiveUpload,
} from "../controller/lecture.controller.js";
import {
  authentication,
  authorization,
} from "../middleware/auth.middleware.js";
// import { multerErrorHandler } from "../utils/multer.utils.js";
import {
  VideoCreateValidate,
  UploadAuthValidate,
  completeVideoValidate,
} from "../validation/lecture.valid.js";
const lectureRouter = Router();

// lectureRouter.post('/create' ,authentication , authorization ,upload.single('media'), multerErrorHandler,  uploadLecture)

lectureRouter.post(
  "/video-create",
  VideoCreateValidate,
  authentication,
  authorization,
  createVideo,
);
lectureRouter.post(
  "/upload-auth/:videoId",
  UploadAuthValidate,
  authentication,
  authorization,
  uploadAuth,
);
lectureRouter.post(
  "/complete-video/:videoId",
  completeVideoValidate,
  authentication,
  authorization,
  completeVideo,
);

lectureRouter.get(
  "/active-check",
  authentication,
  authorization,
  checkActiveUpload,
);
export default lectureRouter;
