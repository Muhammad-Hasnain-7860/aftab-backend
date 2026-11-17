import mongoose from "mongoose";

const MarksSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lectureSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LectureSession",
      required: true,
    },

    recitationMarks: {
      type: Number,
      default: 0,
    },

    totalMarks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const marksModel = mongoose.model("marks", MarksSchema);

export default marksModel;
