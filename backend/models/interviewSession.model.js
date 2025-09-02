// FILE: backend/models/interviewSession.model.js

import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema({
  // The user who took this interview
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // The job role the user was interviewed for
  jobRole: {
    type: String,
    required: true,
  },
  // The difficulty level of the session
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  // Status of the interview
  status: {
    type: String,
    enum: ["in-progress", "completed", "cancelled"],
    default: "in-progress",
  },
  // --- FINAL SCORES (Calculated and stored upon completion) ---
  finalFluencyScore: { type: Number, default: 0 },
  finalConfidenceScore: { type: Number, default: 0 },
  finalCorrectnessScore: { type: Number, default: 0 },
  finalBodyLanguageScore: { type: Number, default: 0 },
  overallScore: { type: Number, default: 0 },
  overallFeedback: { type: String, default: "" },
}, { timestamps: true });

const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);
export default InterviewSession;
