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

export const updateLectureSessionDeadline = async (req, res) => {
  try {
    const { courseId, sessionId } = req.params;
    const { deadline } = req.body;

    const session = await LectureSession.findById(sessionId);

    if (!session) {
      return apiResponse(res, 404, "Lecture session not found");
    }

    const lecture = await lectureModel.findOne({
      _id: session.lectureId,
      courseId,
    });

    if (!lecture) {
      return apiResponse(res, 404, "Lecture session not found for this course");
    }

    const [year, month, day] = deadline.split("-").map(Number);
    const newDeadline = Date.UTC(year, month - 1, day);

    if (session.deadline) {
      const [currentDay, currentMonth, currentYear] = session.deadline
        .split("-")
        .map(Number);
      const currentDeadline = Date.UTC(
        currentYear,
        currentMonth - 1,
        currentDay,
      );

      if (newDeadline <= currentDeadline) {
        return apiResponse(
          res,
          400,
          "New deadline must be later than current deadline",
        );
      }
    }

    session.deadline = [
      String(day).padStart(2, "0"),
      String(month).padStart(2, "0"),
      year,
    ].join("-");

    await session.save();

    return apiResponse(res, 200, "Deadline updated successfully", {
      _id: session._id,
      deadline: session.deadline,
    });
  } catch (error) {
    console.error("Update lecture session deadline error:", error);
    return apiResponse(res, 500, "Failed to update lecture session deadline");
  }
};