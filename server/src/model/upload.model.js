import mongoose from "mongoose";

const uploadSessionSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    videoId: {
      type: String,
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "completed", "failed"],
      default: "active",
    },
    failedSeen: { type: Boolean, default: false },
    firstCompleteCheckAt : {
      type: Date,
    }
  },
  { timestamps: true },
);

// One active upload per admin
uploadSessionSchema.index(
  { adminId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" },
  },
);

const uploadSessionModel = mongoose.model("UploadSession", uploadSessionSchema);

export default uploadSessionModel;
