import jwt from 'jsonwebtoken'
import config from '../config/dotenv.js'

export const generateTokens = (id , kind , sessionId)=>{
    const secret = kind === 'access' ? config.ACCESS_SECRET  : config.REFRESH_SECRET
    const payload = {id : id , role : 'student'}
    sessionId && (payload.sessionId = sessionId)
    const expire = {
        expiresIn : kind === 'access' ? config.ACCESS_EXPIRE : config.REFRESH_EXPIRE
    }

    const token = jwt.sign(payload , secret , expire)
    return token

}

export const verifyAccessToken = (token)=>{
    const decode = jwt.verify(token,config.ACCESS_SECRET)
    return decode
}

export const verifyRefreshToken = (token)=>{
    const decode = jwt.verify(token , config.REFRESH_SECRET)
    return decode
}