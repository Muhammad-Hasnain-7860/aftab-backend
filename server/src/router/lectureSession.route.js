import {Router} from 'express'
import {
  authentication,
  authorization,
  courseAccessAuthorization,
} from '../middleware/auth.middleware.js'
import {
  allLectureSession,
  updateLectureSessionDeadline,
} from '../controller/lectureSession.controller.js'
import {
  lectureSessionValid,
  updateLectureSessionDeadlineValid,
} from '../validation/lectureSession.valid.js'

const lectureSessionRouter = Router()

lectureSessionRouter.get(
  '/:courseId',
  authentication,
  lectureSessionValid,
  courseAccessAuthorization,
  allLectureSession,
)
lectureSessionRouter.patch(
  '/:courseId/:sessionId/deadline',
  authentication,
  authorization,
  updateLectureSessionDeadlineValid,
  updateLectureSessionDeadline,
)

export default lectureSessionRouter