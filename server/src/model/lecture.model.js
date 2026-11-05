import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lecture title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Apne Course model ka reference dein
      required: true,
    },
    videoUrl: {
      videoId: {
        type: String,
        required: true,
        unique: true, 
      },
      libraryId: {
        type: String,
        required: true,
      },
      playbackUrl: {
        type: String,
        required: true,
      },
    },
    duration: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      required: true,
    },
    resources: [
      {
        title: String,
        fileUrl: String,
      },
    ],
  },
  {
    timestamps: true, // Yeh automatically 'createdAt' aur 'updatedAt' fields add kar dega
  },
);

const lectureModel = mongoose.model("lectures", lectureSchema);

export default lectureModel;
