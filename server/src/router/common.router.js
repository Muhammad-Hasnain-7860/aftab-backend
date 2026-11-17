import {Router} from 'express'
import {
  authentication,
  authorization,
  studentAuthorization,
  studentCourseAccess,
} from '../middleware/auth.middleware.js'
import { courseBy, getAllStudents, getCourseMarks, getDashboardStats, getMyCourseMarks, getMyCourses, getTodayPendingStudents, getTodaySessions, getTodaySubmittedStudents, grantCourseAccess } from '../controller/common.controller.js'
import { commonValid, grantCourseAccessValid } from '../validation/common.valid.js'

const commonRouter = Router()

commonRouter.get('/courseBy/:courseId', authentication, authorization, commonValid, courseBy)
commonRouter.get('/students', authentication, authorization, getAllStudents)
commonRouter.patch('/students/:studentId/courses', authentication, authorization, grantCourseAccessValid, grantCourseAccess)
commonRouter.get('/my-courses', authentication, studentAuthorization, getMyCourses)
commonRouter.get('/my-courses/:courseId/marks', authentication, commonValid, studentCourseAccess, getMyCourseMarks)
commonRouter.get('/course-marks/:courseId', authentication, authorization, commonValid, getCourseMarks)
commonRouter.get('/dashboard-stats/:courseId', authentication, authorization, commonValid, getDashboardStats)
commonRouter.get('/dashboard-todayLecture/:courseId', authentication, authorization, commonValid, getTodaySessions)
commonRouter.get('/dashboard-todayPendingStudents/:courseId', authentication, authorization, commonValid, getTodayPendingStudents)
commonRouter.get('/dashboard-todaySubmission/:courseId', authentication, authorization, commonValid, getTodaySubmittedStudents)
export default commonRouter