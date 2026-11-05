import { cookie, validationResult } from "express-validator";
import { apiResponse } from "../utils/api.utils.js";

export const refreshValid = [
  cookie("refreshToken")
    .exists({ values: "falsy" })
    .withMessage("Refresh token is required")
    .bail()
    .isString()
    .withMessage("Refresh token must be a string")
    .bail()
    .isJWT()
    .withMessage("Refresh token must be a valid JWT format"),

    (req,res,next)=>{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return apiResponse(res,400,{errors: errors.array()})
        }
        next()
    }
];
