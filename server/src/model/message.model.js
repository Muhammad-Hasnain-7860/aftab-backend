import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    lectureSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LectureSession",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    content: {
      type: String,
      required: true,
    },
    typeContent: {
      type: String,
      required: true,
      enum: ["text", "audio"],
      default: "text",
    },
  },
  {
    timestamps: true,
  },
);

const messagesModel = mongoose.model("messages", messageSchema);

export default messagesModel;