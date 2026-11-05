
import mongoose from "mongoose"

const sessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        refreshTokenHash: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true
        },
        isRevoked: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
)

sessionSchema.index({ userId: 1, isRevoked: 1, expiresAt: 1 })

export default mongoose.model("Session", sessionSchema)
