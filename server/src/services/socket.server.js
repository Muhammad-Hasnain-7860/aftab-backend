import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/auth.utils.js";
import userModel from "../model/auth.model.js";
import messagesModel from "../model/message.model.js";
import { LectureSession } from "../model/lectureSession.model.js";
import { uploadAudio } from "../utils/b2Audio.js";
import cors from "cors";
import marksModel from "../model/marks.model.js";
import { userHasCourseAccess } from "../middleware/auth.middleware.js";

const getStudentSession = async (user, sessionId) => {
  const session = await LectureSession.findById(sessionId).populate(
    "lectureId",
    "courseId",
  );

  if (!session || !userHasCourseAccess(user, session.lectureId?.courseId)) {
    return null;
  }

  return session;
};

export const socketServer = (httpServer) => {
  const io = new Server(httpServer, {
    maxHttpBufferSize: 30 * 1024 * 1024,

    cors: {
      origin: "https://frontend-aftab.vercel.app",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake?.headers?.authorization;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decode = verifyAccessToken(token);

      const user = await userModel.findById(decode.id);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      return next(new Error("invalid or expired access token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    const role = socket.user.role;

    socket.join(`user_${userId}`);

    if (role === "admin") {
      socket.join("admin");
    }

    console.log("Connected:", userId);

    socket.on("send_audio", async (data, callback) => {
      try {
        if (role !== "user") {
          return callback?.({
            success: false,
            message: "Only students can send audio",
          });
        }

        const { sessionId, mimeType } = data;

        if (!sessionId || !data.audio) {
          return callback?.({
            success: false,
            message: "Audio and session are required",
          });
        }

        const audio = Buffer.from(data.audio);

        if (!audio.length || audio.length > 30 * 1024 * 1024) {
          return callback?.({
            success: false,
            message: "Audio must be between 1 byte and 30 MB",
          });
        }

        if (!mimeType?.startsWith("audio/")) {
          return callback?.({
            success: false,
            message: "Invalid audio format",
          });
        }

        const session = await getStudentSession(socket.user, sessionId);

        if (!session || session.status !== "active") {
          return callback?.({
            success: false,
            message: "Session is not active or you do not have course access",
          });
        }

        const now = new Date();

        const today = [
          String(now.getDate()).padStart(2, "0"),
          String(now.getMonth() + 1).padStart(2, "0"),
          now.getFullYear(),
        ].join("-");

        const [d, m, y] = today.split("-").map(Number);
        const todayDate = new Date(y, m - 1, d);

        const [dd, mm, yy] = session.deadline.split("-").map(Number);
        const deadlineDate = new Date(yy, mm - 1, dd);

        if (todayDate > deadlineDate) {
          return callback?.({
            success: false,
            message: "Submission deadline has passed",
          });
        }

        const key = await uploadAudio(audio, mimeType);

        // Save message
        const message = await messagesModel.create({
          lectureSessionId: sessionId,
          senderId: userId,
          receiverId: null,
          content: key,
          typeContent: "audio",
        });

        // Update marks
        const marks = await marksModel.findOneAndUpdate(
          {
            studentId: userId,
            lectureSessionId: sessionId,
          },
          {
            $set: {
              recitationMarks: 10,
            },
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        );

        marks.totalMarks = marks.recitationMarks;
        await marks.save();

        io.to("admin").emit("receive_message", message);

        callback?.({
          success: true,
          message: "Audio sent",
          data: message,
          marks,
        });
      } catch (error) {
        console.error(error);

        callback?.({
          success: false,
          message: error.message || "Audio sending failed",
        });
      }
    });

    socket.on("reply_message", async (data, callback) => {
      try {
        if (role !== "admin") {
          return callback?.({
            success: false,
            message: "Only Admin can reply",
          });
        }

        const { studentId, sessionId, content } = JSON.parse(data);

        if (!studentId || !sessionId || !content?.trim()) {
          return callback?.({
            success: false,
            message: "Required fields missing",
          });
        }

        const session = await LectureSession.findById(sessionId);

        if (!session) {
          return callback?.({
            success: false,
            message: "Session not found",
          });
        }

        const now = new Date();

        const today = [
          String(now.getDate()).padStart(2, "0"),
          String(now.getMonth() + 1).padStart(2, "0"),
          now.getFullYear(),
        ].join("-");

        const [d, m, y] = today.split("-").map(Number);
        const todayDate = new Date(y, m - 1, d);

        const [dd, mm, yy] = session.deadline.split("-").map(Number);
        const deadlineDate = new Date(yy, mm - 1, dd);

        if (todayDate > deadlineDate) {
          return callback?.({
            success: false,
            message: "Submission deadline has passed",
          });
        }

        const message = await messagesModel.create({
          lectureSessionId: sessionId,
          senderId: userId,
          receiverId: studentId,
          content: content.trim(),
        });

        io.to(`user_${studentId}`).emit("receive_message", message);

        callback?.({
          success: true,
          message: "Reply sent",
          data: message,
        });
      } catch (error) {
        console.error(error);
        callback?.({
          success: false,
          message: "Reply failed",
        });
      }
    });

    socket.on("send_message", async (data, callback) => {
      try {
        if (role !== "user") {
          return callback?.({
            success: false,
            message: "Only students can send messages",
          });
        }

        const { sessionId, content } =
          typeof data === "string" ? JSON.parse(data) : data;

        if (!sessionId || !content?.trim()) {
          return callback?.({
            success: false,
            message: "Required fields missing",
          });
        }

        const session = await getStudentSession(socket.user, sessionId);

        if (!session || session.status !== "active") {
          return callback?.({
            success: false,
            message: "Session is not active or you do not have course access",
          });
        }

        const now = new Date();

        const today = [
          String(now.getDate()).padStart(2, "0"),
          String(now.getMonth() + 1).padStart(2, "0"),
          now.getFullYear(),
        ].join("-");

        const [d, m, y] = today.split("-").map(Number);
        const todayDate = new Date(y, m - 1, d);

        const [dd, mm, yy] = session.deadline.split("-").map(Number);
        const deadlineDate = new Date(yy, mm - 1, dd);

        if (todayDate > deadlineDate) {
          return callback?.({
            success: false,
            message: "Submission deadline has passed",
          });
        }

        const message = await messagesModel.create({
          lectureSessionId: sessionId,
          senderId: userId,
          receiverId: null,
          content: content.trim(),
          typeContent: "text",
        });

        io.to("admin").emit("receive_message", message);

        callback?.({
          success: true,
          message: "Message sent",
          data: message,
        });
      } catch (error) {
        console.error(error);

        callback?.({
          success: false,
          message: "Message sending failed",
        });
      }
    });

    socket.on("fetch_messages", async (data, callback) => {
      console.log("fetch_messages", data);
      try {
        const { sessionId, studentId } = JSON.parse(data);

        if (!sessionId) {
          return callback?.({
            success: false,
            message: "Session ID required",
          });
        }

        if (role === "user") {
          const session = await getStudentSession(socket.user, sessionId);
          if (!session) {
            return callback?.({
              success: false,
              message: "You do not have access to this session",
            });
          }
        }

        let query;

        if (role === "user") {
          query = {
            lectureSessionId: sessionId,
            $or: [{ senderId: userId }, { receiverId: userId }],
          };
        } else if (role === "admin") {
          if (!studentId) {
            return callback?.({
              success: false,
              message: "Student ID required",
            });
          }

          query = {
            lectureSessionId: sessionId,
            $or: [
              { senderId: studentId, receiverId: null },
              { senderId: userId, receiverId: studentId },
            ],
          };
        } else {
          return callback?.({
            success: false,
            message: "Unauthorized",
          });
        }

        const messages = await messagesModel
          .find(query)
          .sort({ createdAt: 1 })
          .populate("senderId", "displayName role");

        console.log(messages);

        callback?.({
          success: true,
          data: messages,
        });
      } catch (error) {
        console.error(error);

        callback?.({
          success: false,
          message: "Failed to fetch messages",
        });
      }
    });

    socket.on("reply_audio", async (data, callback) => {
      try {
        if (role !== "admin") {
          return callback?.({
            success: false,
            message: "Only Qari can reply with audio",
          });
        }

        const { sessionId, studentId, mimeType } = data;

        if (!sessionId || !studentId || !data.audio) {
          return callback?.({
            success: false,
            message: "Audio, student and session are required",
          });
        }

        const audio = Buffer.from(data.audio);

        if (!audio.length) {
          return callback?.({
            success: false,
            message: "Audio is empty",
          });
        }

        if (audio.length > 20 * 1024 * 1024) {
          return callback?.({
            success: false,
            message: "Audio must be under 20 MB",
          });
        }

        if (!mimeType?.startsWith("audio/")) {
          return callback?.({
            success: false,
            message: "Invalid audio format",
          });
        }

        const session = await LectureSession.findById(sessionId);

        if (!session || session.status !== "active") {
          return callback?.({
            success: false,
            message: "Session is not active",
          });
        }

        // const studentMessage = await messagesModel.findOne({
        //   lectureSessionId: sessionId,
        //   senderId: studentId,
        // });

        // if (!studentMessage) {
        //   return callback?.({
        //     success: false,
        //     message: "Student does not belong to this session",
        //   });
        // }

        const now = new Date();

        const today = [
          String(now.getDate()).padStart(2, "0"),
          String(now.getMonth() + 1).padStart(2, "0"),
          now.getFullYear(),
        ].join("-");

        const [d, m, y] = today.split("-").map(Number);
        const todayDate = new Date(y, m - 1, d);

        const [dd, mm, yy] = session.deadline.split("-").map(Number);
        const deadlineDate = new Date(yy, mm - 1, dd);

        if (todayDate > deadlineDate) {
          return callback?.({
            success: false,
            message: "Submission deadline has passed",
          });
        }

        const key = await uploadAudio(audio, mimeType);

        const message = await messagesModel.create({
          lectureSessionId: sessionId,
          senderId: userId,
          receiverId: studentId,
          content: key,
          typeContent: "audio",
        });

        io.to(`user_${studentId}`).emit("receive_message", message);

        callback?.({
          success: true,
          message: "Audio reply sent",
          data: message,
        });
      } catch (error) {
        console.error(error);

        callback?.({
          success: false,
          message: "Audio reply failed",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected:", userId);
    });
  });
};
