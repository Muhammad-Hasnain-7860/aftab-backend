import courseModel from "../../src/model/course.model.js";
import uploadPhoto from "../services/imagekit.service.js";
import { apiResponse } from "../utils/api.utils.js";

export const createCourse = async (req, res) => {
  const user = req.user;
  const { title, description, price, detail } = req.body;

  const file = req.file;

  if (!file) {
    return apiResponse(res, 400, "Thumbnail is required");
  }

  const result = await uploadPhoto(file.buffer, file.originalname);

  const course = await courseModel.create({
    title,
    description,
    price,
    thumbnail: result.url,
    adminId: user._id,
    isPublished: true,
    detail,
  });

  return apiResponse(res, 201, "course created SuccessFully", course);
};

export const getAllCourses = async (req, res) => {
  const courses = await courseModel.find();

  return apiResponse(res, 200, "fetched courses SuccessFully", courses);
};
