
import { param, validationResult } from "express-validator";

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
