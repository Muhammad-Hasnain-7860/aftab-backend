import {Router} from 'express'
import { authentication, authorization } from '../middleware/auth.middleware.js'
import { allLectureSession } from '../controller/lectureSession.controller.js'
import { lectureSessionValid } from '../validation/lectureSession.valid.js'

const lectureSessionRouter = Router()

lectureSessionRouter.get('/:courseId' , authentication , authorization , lectureSessionValid,  allLectureSession)

export default lectureSessionRouter