import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  displayName: {
    required: true,
    type: String,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    unique: true,
  },
  googleId: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  role: {
    required: true,
    type: String,
    default: "user",
  },
});

const userModel = mongoose.model("users", userSchema);

export default userModel;
