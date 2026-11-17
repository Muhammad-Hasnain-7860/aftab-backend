import { body, param, validationResult } from "express-validator";

export const commonValid = [
  param("courseId")
    .exists()
    .withMessage("CourseId is required")
    .bail()
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

export const grantCourseAccessValid = [
  param("studentId")
    .exists()
    .withMessage("StudentId is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid studentId"),
  body("courseId")
    .exists()
    .withMessage("CourseId is required")
    .bail()
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
