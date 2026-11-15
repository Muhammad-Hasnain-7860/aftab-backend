import mongoose from "mongoose";

const lectureSessionSchema = new mongoose.Schema(
  {
    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lectures",
      required: true,
    },

    deadline: {
      type: String,
    },

    status: {
      type: String,
      enum: ["scheduled", "active", "completed"],
      default: "active",
    },
  },
  { timestamps: true },
);

lectureSessionSchema.pre("save", function () {
  if (this.isNew) {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    this.deadline = [
      String(date.getDate()).padStart(2, "0"),
      String(date.getMonth() + 1).padStart(2, "0"),
      date.getFullYear(),
    ].join("-");
  }
});

export const LectureSession = mongoose.model(
  "LectureSession",
  lectureSessionSchema,
);
