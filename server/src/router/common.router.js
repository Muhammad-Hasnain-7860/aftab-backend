import {Router} from 'express'
import { authentication, authorization } from '../middleware/auth.middleware.js'
import { courseBy, getDashboardStats, getTodaySessions } from '../controller/common.controller.js'
import { commonValid } from '../validation/common.valid.js'

const commonRouter = Router()

commonRouter.get('/courseBy/:courseId', authentication, authorization, commonValid, courseBy)
commonRouter.get('/dashboard-stats/:courseId', authentication, authorization, commonValid, getDashboardStats)
commonRouter.get('/dashboard-todayLecture/:courseId', authentication, authorization, commonValid, getTodaySessions)
export default commonRouter