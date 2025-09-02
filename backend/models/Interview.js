import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fluencyScore: { type: Number, required: true },
    confidenceScore: { type: Number, required: true },
    correctnessScore: { type: Number, required: true },
    bodyLanguageScore: { type: Number, required: true },
    jobRole: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;
