import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  fluency: { type: String },
  correctness: { type: String },
  confidence: { type: String },
  bodyLanguage: { type: String },
  fluencyScore: { type: Number, default: 0 },
  correctnessScore: { type: Number, default: 0 },
  confidenceScore: { type: Number, default: 0 },
  bodyLanguageScore: { type: Number, default: 0 },
});

const interviewSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobRole: { type: String, required: true },
    difficulty: { type: String, default: "Medium" },
    answers: [answerSchema],

    // Final aggregated scores
    overallScore: { type: Number, default: 0 },
    finalFluencyScore: { type: Number, default: 0 },
    finalConfidenceScore: { type: Number, default: 0 },
    finalCorrectnessScore: { type: Number, default: 0 },
    finalBodyLanguageScore: { type: Number, default: 0 },

    feedback: { type: String },

    status: { type: String, enum: ["in-progress", "completed"], default: "completed" },
  },
  { timestamps: true }
);

const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);
export default InterviewSession;
