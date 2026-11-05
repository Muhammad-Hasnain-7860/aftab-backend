import { body, validationResult, param } from "express-validator";
import { apiResponse } from "../utils/api.utils.js";

export const VideoCreateValidate = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .bail()
    .isString()
    .withMessage("Title must be a string")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long"),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse(res, 400, "Validation Error", errors.array());
    }

    next();
  },
];

export const UploadAuthValidate = [
  param("videoId")
    .notEmpty()
    .withMessage("videoId is Required")
    .bail()
    .isString()
    .withMessage("video Id must be a String")
    .bail()
    .isUUID()
    .withMessage("Invalid video ID"),
  (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return apiResponse(res, 400, "invalid data", error.array());
    }
    next();
  },
];

export const completeVideoValidate = [
  param("videoId")
    .notEmpty()
    .withMessage("videoId is required")
    .bail()
    .isUUID()
    .withMessage("Invalid video ID"),
  body("courseId")
    .notEmpty()
    .withMessage("courseId is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid course ID"),
  body("order")
    .notEmpty()
    .withMessage("order is required")
    .bail()
    .isInt({ min: 0 })
    .withMessage("order must be a non-negative integer")
    .toInt(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse(res, 400, "Validation Error", errors.array());
    }

    next();
  },
];