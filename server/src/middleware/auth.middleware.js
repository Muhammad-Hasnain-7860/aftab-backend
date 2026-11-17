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

export const userHasCourseAccess = (user, courseId) => {
  const assignedCourses = [...(user.courses || []), user.course].filter(Boolean);

  return assignedCourses.some(
    (assignedCourse) => assignedCourse.toString() === String(courseId),
  );
};

export const studentAuthorization = (req, res, next) => {
  if (req.user.role !== "user") {
    return apiResponse(res, 403, "Only students can access this resource");
  }

  return next();
};

export const studentCourseAccess = (req, res, next) => {
  if (
    req.user.role !== "user" ||
    !userHasCourseAccess(req.user, req.params.courseId)
  ) {
    return apiResponse(res, 403, "You do not have access to this course");
  }

  return next();
};

export const courseAccessAuthorization = (req, res, next) => {
  if (req.user.role === "admin") {
    return next();
  }

  return studentCourseAccess(req, res, next);
};
