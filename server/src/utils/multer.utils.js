import multer from "multer"
import { apiResponse } from "./api.utils.js"

export const multerErrorHandler = (err , req , res , next)=>{

    console.log(err)

    if (err instanceof multer.MulterError || err.message?.includes('allowed!')) {
        return apiResponse(res , 400 , err.message , {error_type : 'ClientError'})
    }


    next()
}