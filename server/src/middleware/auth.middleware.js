import userModel from "../model/auth.model.js";
import sessionModel from "../model/session.model.js";
import { apiResponse } from "../utils/api.utils.js";
import { verifyAccessToken } from "../utils/auth.utils.js";

export const authentication = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return apiResponse(res, 401, "Access token is required");
  }


  try {
    const decode = verifyAccessToken(token);

    if (!decode.id || !decode.sessionId) {
      return apiResponse(res, 401, "Invalid access token payload");
    }

    const user = await userModel.findById(decode.id);

    const session = await sessionModel.findOne({
      _id: decode.sessionId,
      userId: decode.id,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!user || !session) {
      return apiResponse(res, 401, "Unauthorized: Invalid or expired session");
    }

    req.user = user;
    req.session = session;

    next();
  } catch (error) {
    return apiResponse(res, 401, "Invalid or expired access token");
  }
};


export const authorization = (req , res , next)=>{
  const user = req.user

  if(user.role !== 'admin'){
    return apiResponse(res , 403 , 'Forbidden : You are not authorized to access this resource')
  }
  return next()
}
