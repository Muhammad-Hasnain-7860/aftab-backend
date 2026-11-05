import mongoose from 'mongoose'

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    adminId : {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref : 'users'
    }
  },
  { timestamps: true }
);

const courseModel = mongoose.model('courses' , courseSchema)

export default courseModel