import {Router} from 'express'
import { authentication, authorization } from '../middleware/auth.middleware.js'
import  {createCourse}  from '../controller/course.controller.js'
import createCourseValid from '../validation/course.valid.js'

const courseRouter = Router()

courseRouter.post('/create' , createCourseValid,  authentication , authorization , createCourse)

export default courseRouter