import userModel from "../model/auth.model.js";
import lectureModel from "../model/lecture.model.js";
import { LectureSession } from "../model/lectureSession.model.js";
import marksModel from "../model/marks.model.js";
import messagesModel from "../model/message.model.js";
import courseModel from "../model/course.model.js";
import { apiResponse } from "../utils/api.utils.js";

const studentsInCourse = (courseId) => ({
  role: "user",
  $or: [{ courses: courseId }, { course: courseId }],
});

export const courseBy = async (req, res) => {
  try {
    const { courseId } = req.params;

    const students = await userModel
      .find(studentsInCourse(courseId))
      .select("_id displayName email role course courses");

    return apiResponse(res, 200, "Students fetched successfully", students);
  } catch (error) {
    console.error("Course students error:", error);
    return apiResponse(res, 500, "Failed to fetch students for this course");
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await userModel
      .find({ role: "user" })
      .select("_id displayName email course courses")
      .populate("course", "title")
      .populate("courses", "title")
      .sort({ displayName: 1 });

    return apiResponse(res, 200, "Students fetched successfully", students);
  } catch (error) {
    console.error("All students error:", error);
    return apiResponse(res, 500, "Failed to fetch students");
  }
};

export const getMyCourses = async (req, res) => {
  try {
    const courseIds = [
      ...new Set(
        [...(req.user.courses || []), req.user.course]
          .filter(Boolean)
          .map((courseId) => courseId.toString()),
      ),
    ];

    const courses = await courseModel
      .find({ _id: { $in: courseIds } })
      .select("_id title description thumbnail");

    return apiResponse(res, 200, "Your courses fetched successfully", courses);
  } catch (error) {
    console.error("Student courses error:", error);
    return apiResponse(res, 500, "Failed to fetch your courses");
  }
};

export const grantCourseAccess = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId } = req.body;

    const [student, course] = await Promise.all([
      userModel.findOne({ _id: studentId, role: "user" }),
      courseModel.findById(courseId).select("_id"),
    ]);

    if (!student) {
      return apiResponse(res, 404, "Student not found");
    }

    if (!course) {
      return apiResponse(res, 404, "Course not found");
    }

    const assignedCourseIds = new Set(
      (student.courses || []).map((assignedCourseId) =>
        assignedCourseId.toString(),
      ),
    );

    if (student.course) {
      assignedCourseIds.add(student.course.toString());
    }

    if (!assignedCourseIds.has(course._id.toString())) {
      assignedCourseIds.add(course._id.toString());
      student.courses = [...assignedCourseIds];
      await student.save();
    }

    const updatedStudent = await userModel
      .findById(studentId)
      .select("_id displayName email course courses")
      .populate("course", "title")
      .populate("courses", "title");

    return apiResponse(
      res,
      200,
      "Course access granted successfully",
      updatedStudent,
    );
  } catch (error) {
    console.error("Grant course access error:", error);
    return apiResponse(res, 500, "Failed to grant course access");
  }
};

export const getMyCourseMarks = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lectures = await lectureModel.find({ courseId }).select("_id");
    const sessions = await LectureSession.find({
      lectureId: { $in: lectures.map((lecture) => lecture._id) },
    })
      .select("_id lectureId")
      .populate("lectureId", "title");

    const marks = await marksModel
      .find({
        studentId: req.user._id,
        lectureSessionId: { $in: sessions.map((session) => session._id) },
      })
      .select("lectureSessionId recitationMarks totalMarks")
      .lean();

    const marksBySession = new Map(
      marks.map((mark) => [String(mark.lectureSessionId), mark]),
    );
    const sessionMarks = sessions.map((session) => {
      const mark = marksBySession.get(String(session._id));

      return {
        lectureSessionId: session._id,
        lectureTitle: session.lectureId?.title || "Lecture",
        recitationMarks: mark?.recitationMarks || 0,
        totalMarks: mark?.totalMarks || 0,
      };
    });

    return apiResponse(res, 200, "Your course marks fetched successfully", {
      totalMarks: sessionMarks.reduce(
        (total, mark) => total + mark.totalMarks,
        0,
      ),
      marks: sessionMarks,
    });
  } catch (error) {
    console.error("Student course marks error:", error);
    return apiResponse(res, 500, "Failed to fetch your course marks");
  }
};

export const getCourseMarks = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [lectures, students] = await Promise.all([
      lectureModel.find({ courseId }).select("_id"),
      userModel.find(studentsInCourse(courseId)).select("_id displayName email"),
    ]);

    const sessions = await LectureSession.find({
      lectureId: { $in: lectures.map((lecture) => lecture._id) },
    })
      .select("_id lectureId")
      .populate("lectureId", "title");

    const marks = await marksModel
      .find({
        studentId: { $in: students.map((student) => student._id) },
        lectureSessionId: { $in: sessions.map((session) => session._id) },
      })
      .select("studentId lectureSessionId recitationMarks totalMarks")
      .lean();

    const marksByStudentAndSession = new Map(
      marks.map((mark) => [
        `${mark.studentId}:${mark.lectureSessionId}`,
        mark,
      ]),
    );

    const data = students.map((student) => {
      const studentMarks = sessions.map((session) => {
        const mark = marksByStudentAndSession.get(
          `${student._id}:${session._id}`,
        );

        return {
          lectureSessionId: session._id,
          lectureTitle: session.lectureId?.title || "Lecture",
          recitationMarks: mark?.recitationMarks || 0,
          totalMarks: mark?.totalMarks || 0,
        };
      });

      return {
        _id: student._id,
        displayName: student.displayName,
        email: student.email,
        totalMarks: studentMarks.reduce(
          (total, mark) => total + mark.totalMarks,
          0,
        ),
        marks: studentMarks,
      };
    });

    return apiResponse(res, 200, "Course marks fetched successfully", data);
  } catch (error) {
    console.error("Course marks error:", error);
    return apiResponse(res, 500, "Failed to fetch course marks");
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
      userModel.countDocuments(studentsInCourse(courseId)),

      LectureSession.countDocuments({
        lectureId: { $in: lectureIds },
      }),

      LectureSession.find({
        lectureId: { $in: lectureIds },
        status: "active",
        deadline: today,
      }).select("_id lectureId"),
    ]);

    const students = await userModel.find(studentsInCourse(courseId)).select("_id");

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
      userModel.find(studentsInCourse(courseId)).select("_id"),
    ]);

    const sessions = await LectureSession.find({
      lectureId: { $in: lectures.map((l) => l._id) },
      deadline: today,
      status: "active",
    }).populate("lectureId", "title");

    const studentIds = students.map((s) => s._id);

    const data = await Promise.all(
      sessions.map(async (session, index) => {
        const submittedStudents = await messagesModel.distinct("senderId", {
          lectureSessionId: session._id,
          typeContent: "audio",
          senderId: { $in: studentIds },
        });

        return {
          sessionNumber: index + 1,
          sessionId: session._id,
          status: session.status,
          lectureTitle: session.lectureId?.title,
          sessionDate: session.createdAt,
          submissionDeadline: session.deadline,

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

    // No active session today
    if (sessions.length === 0) {
      return apiResponse(res, 200, "No active session today", []);
    }

    const students = await userModel
      .find(studentsInCourse(courseId))
      .select("_id displayName email");

    const submittedIds = await messagesModel.distinct("senderId", {
      lectureSessionId: { $in: sessions.map((s) => s._id) },
      typeContent: "audio",
    });

    const pendingStudents = students.filter(
      (student) =>
        !submittedIds.some(
          (id) => id.toString() === student._id.toString()
        )
    );

    return apiResponse(
      res,
      200,
      "Pending students fetched",
      pendingStudents
    );
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
      .find(studentsInCourse(courseId))
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
