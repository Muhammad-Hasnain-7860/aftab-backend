import { Router } from "express";
// import upload from "../config/multer.js";
// import {
//   completeVideo,
//   createVideo,
//   uploadAuth,
//   checkActiveUpload,
//   createLecture,
// } from "../controller/lecture.controller.js";

import {allLecture, createLecture} from '../controller/lecture.controller.js'

import {
  authentication,
  authorization,
} from "../middleware/auth.middleware.js";
// import { multerErrorHandler } from "../utils/multer.utils.js";
// import {
//   VideoCreateValidate,
//   UploadAuthValidate,
//   completeVideoValidate,
//   createLectureValid,
// } from "../validation/lecture.valid.js";
import {createLectureValid, getAllLectureValid} from '../validation/lecture.valid.js'
import multerErrorHandler from "../middleware/error.middleware.js";
import upload from "../config/multer.js";
const lectureRouter = Router();

// lectureRouter.post('/create' ,authentication , authorization ,upload.single('media'), multerErrorHandler,  uploadLecture)

// lectureRouter.post(
//   "/video-create",
//   VideoCreateValidate,
//   authentication,
//   authorization,
//   createVideo,
// );
// lectureRouter.post(
//   "/upload-auth/:videoId",
//   UploadAuthValidate,
//   authentication,
//   authorization,
//   uploadAuth,
// );
// lectureRouter.post(
//   "/complete-video/:videoId",
//   completeVideoValidate,
//   authentication,
//   authorization,
//   completeVideo,
// );

// lectureRouter.get(
//   "/active-check",
//   authentication,
//   authorization,
//   checkActiveUpload,
// );

lectureRouter.post("/create", authentication , authorization , upload.single("audio"),multerErrorHandler ,createLectureValid ,  createLecture);
lectureRouter.get('/:courseId' , authentication , getAllLectureValid , allLecture)
export default lectureRouter;
