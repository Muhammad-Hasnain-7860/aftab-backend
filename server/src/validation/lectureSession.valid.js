
import { body, param, validationResult } from "express-validator";

export const lectureSessionValid = [
 param("courseId")
  .exists()
  .withMessage("CourseId is required")
  .isMongoId()
  .withMessage("Invalid courseId"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: "Validation failed",
        data: errors.array(),
      });
    }

    next();
  },
];

export const updateLectureSessionDeadlineValid = [
  param("courseId")
    .exists()
    .withMessage("CourseId is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid courseId"),
  param("sessionId")
    .exists()
    .withMessage("SessionId is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid sessionId"),
  body("deadline")
    .isDate({ format: "YYYY-MM-DD", strictMode: true })
    .withMessage("Deadline must be a valid date in YYYY-MM-DD format"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: "Validation failed",
        data: errors.array(),
      });
    }

    next();
  },
];
