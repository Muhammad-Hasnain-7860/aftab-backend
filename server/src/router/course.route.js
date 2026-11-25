import {Router} from 'express'
import { authentication, authorization } from '../middleware/auth.middleware.js'
import  {createCourse, getAllCourses, getPublicCourses}  from '../controller/course.controller.js'
import createCourseValid from '../validation/course.valid.js'
import upload from '../config/multer.js'
import multerErrorHandler from '../middleware/error.middleware.js'

const courseRouter = Router()

courseRouter.post('/create' , authentication , authorization, upload.single('thumbnail') ,multerErrorHandler , createCourseValid, createCourse)
courseRouter.get('/public', getPublicCourses)
courseRouter.get('/' , authentication , authentication , getAllCourses)
export default courseRouter