import userModel from "../model/auth.model.js";
import lectureModel from "../model/lecture.model.js";
import { LectureSession } from "../model/lectureSession.model.js";
import marksModel from "../model/marks.model.js";
import messagesModel from "../model/message.model.js";
import { apiResponse } from "../utils/api.utils.js";

export const courseBy = async (req, res) => {
  try {
    const { courseId } = req.params;

    const students = await userModel
      .find({
        role: "user",
        course: courseId,
      })
      .select("_id displayName email role course");

    return apiResponse(res, 200, "Students fetched successfully", students);
  } catch (error) {
    console.error("Course students error:", error);
    return apiResponse(res, 500, "Failed to fetch students for this course");
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const { courseId } = req.params;
    const now = new Date();

    const today = [
      String(now.getDate()).padStart(2, "0"),
      String(now.getMonth() + 1).padStart(2, "0"),
      now.getFullYear(),
    ].join("-");

    const lectures = await lectureModel.find({ courseId }).select("_id");
    const lectureIds = lectures.map((lecture) => lecture._id);

    const [totalStudents, totalLectures, todaySessions] = await Promise.all([
      userModel.countDocuments({
        role: "user",
        course: courseId,
      }),

      LectureSession.countDocuments({
        lectureId: { $in: lectureIds },
      }),

      LectureSession.find({
        lectureId: { $in: lectureIds },
        status: "active",
        deadline: today,
      }).select("_id lectureId"),
    ]);

    const students = await userModel
      .find({
        role: "user",
        course: courseId,
      })
      .select("_id");

    const studentIds = students.map((student) => student._id);

    let pendingSubmissions = 0;

    for (const session of todaySessions) {
      const submittedStudents = await messagesModel.distinct("senderId", {
        lectureSessionId: session._id,
        typeContent: "audio",
        senderId: { $in: studentIds },
      });

      pendingSubmissions += studentIds.length - submittedStudents.length;
    }

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalLectures,
        todaySession: todaySessions.length,
        pendingSubmissions,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};

export const getTodaySessions = async (req, res) => {
  try {
    const { courseId } = req.params;

    const now = new Date();
    const today = [
      String(now.getDate()).padStart(2, "0"),
      String(now.getMonth() + 1).padStart(2, "0"),
      now.getFullYear(),
    ].join("-");

    const [lectures, students] = await Promise.all([
      lectureModel.find({ courseId }).select("_id"),
      userModel.find({ role: "user", course: courseId }).select("_id"),
    ]);

    const lectureIds = lectures.map((lecture) => lecture._id);
    const studentIds = students.map((student) => student._id);

    const sessions = await LectureSession.find({
      lectureId: { $in: lectureIds },
      deadline: today,
      status: "active",
    }).populate("lectureId", "title");

    const data = await Promise.all(
      sessions.map(async (session, index) => {
        const [listeningCompleted, submittedStudents] = await Promise.all([
          marksModel.distinct("studentId", {
            lectureSessionId: session._id,
            studentId: { $in: studentIds },
            listeningMarks: { $gt: 0 },
          }),

          messagesModel.distinct("senderId", {
            lectureSessionId: session._id,
            typeContent: "audio",
            senderId: { $in: studentIds },
          }),
        ]);

        return {
          sessionNumber: index + 1,
          sessionId: session._id,
          status: session.status,
          lectureTitle: session.lectureId?.title,
          sessionDate: session.createdAt,
          submissionDeadline: session.deadline,

          listeningCompleted: {
            completed: listeningCompleted.length,
            total: students.length,
          },

          recitationsSubmitted: {
            submitted: submittedStudents.length,
            total: students.length,
          },

          pendingSubmissions: students.length - submittedStudents.length,
        };
      }),
    );

    return apiResponse(res, 200, "Today's sessions fetched successfully", data);
  } catch (error) {
    console.error("Today's sessions error:", error);
    return apiResponse(res, 500, "Failed to fetch today's sessions");
  }
};

export const getTodayPendingStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    const now = new Date();
    const today = [
      String(now.getDate()).padStart(2, "0"),
      String(now.getMonth() + 1).padStart(2, "0"),
      now.getFullYear(),
    ].join("-");

    const lectures = await lectureModel.find({ courseId }).select("_id");

    const sessions = await LectureSession.find({
      lectureId: { $in: lectures.map((l) => l._id) },
      deadline: today,
      status: "active",
    });

    const students = await userModel
      .find({
        role: "user",
        course: courseId,
      })
      .select("_id displayName email");

    const submittedIds = await messagesModel.distinct("senderId", {
      lectureSessionId: { $in: sessions.map((s) => s._id) },
      typeContent: "audio",
    });

    const pendingStudents = students.filter(
      (student) =>
        !submittedIds.some((id) => id.toString() === student._id.toString()),
    );

    return apiResponse(res, 200, "Pending students fetched", pendingStudents);
  } catch (error) {
    console.log(error);
    return apiResponse(res, 500, "Failed to fetch pending students");
  }
};

export const getTodaySubmittedStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    const now = new Date();
    const today = [
      String(now.getDate()).padStart(2, "0"),
      String(now.getMonth() + 1).padStart(2, "0"),
      now.getFullYear(),
    ].join("-");

    const lectures = await lectureModel.find({ courseId }).select("_id");

    const sessions = await LectureSession.find({
      lectureId: { $in: lectures.map((l) => l._id) },
      deadline: today,
      status: "active",
    });

    const students = await userModel
      .find({
        role: "user",
        course: courseId,
      })
      .select("_id displayName email");

    const submittedIds = await messagesModel.distinct("senderId", {
      lectureSessionId: { $in: sessions.map((s) => s._id) },
      senderId: { $in: students.map((s) => s._id) },
      typeContent: "audio",
    });

    const submittedStudents = students.filter((student) =>
      submittedIds.some((id) => id.toString() === student._id.toString()),
    );

    return apiResponse(
      res,
      200,
      "Today's submitted students fetched",
      submittedStudents,
    );
  } catch (error) {
    console.log(error);
    return apiResponse(res, 500, "Failed to fetch submitted students");
  }
};
