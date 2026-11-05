import { body, validationResult } from "express-validator";
import { apiResponse } from "../utils/api.utils.js";

const createCourseValid = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required"),

    body("price")
        .notEmpty()
        .withMessage("Price is required")
        .bail()
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),

    body("thumbnail")
        .trim()
        .notEmpty()
        .withMessage("Thumbnail is required")
        .bail()
        .isURL()
        .withMessage("Thumbnail must be a valid URL"),

    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return apiResponse(res, 400, 'invalid data', { errors: errors.array() })
        }

        next()
    }
];

export default createCourseValid;