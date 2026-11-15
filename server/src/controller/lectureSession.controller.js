import lectureModel from "../model/lecture.model.js";
import { LectureSession } from "../model/lectureSession.model.js";
import { apiResponse } from "../utils/api.utils.js";

export const allLectureSession = async (req, res) => {
  try {
    const { courseId } = req.params;

    const lectures = await lectureModel
      .find({ courseId })
      .select("_id");

    const lectureIds = lectures.map((lecture) => lecture._id);

    const sessions = await LectureSession.find({
      lectureId: { $in: lectureIds },
    }).sort({ createdAt: -1 });

    return apiResponse(res, 200, "All sessions fetched successfully", sessions);
  } catch (error) {
    return apiResponse(res, 500, error.message);
  }
};