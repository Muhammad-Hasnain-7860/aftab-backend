export const apiResponse = (res , status , message , data = {})=>{
    res.status(status).json({
        msg : message,
        data : data
    })
}

export const cookieResponse = (res , refreshToken)=>{
   return res.cookie('refreshToken' , refreshToken , {
        httpOnly : true,
        maxAge : 7*24*60*60*1000,
        secure : false,
        sameSite : 'strict'
    })
}