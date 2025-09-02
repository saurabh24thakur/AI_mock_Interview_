// FILE: backend/models/questionResponse.model.js

import mongoose from "mongoose";

const questionResponseSchema = new mongoose.Schema({
  // Link to the parent interview session
  interviewSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewSession",
    required: true,
  },
  // The actual question that was asked
  questionText: {
    type: String,
    required: true,
  },
  // The user's transcribed answer
  userAnswerText: {
    type: String,
    required: true,
  },
  // --- AI SCORING FOR THIS SPECIFIC QUESTION ---
  fluencyScore: { type: Number, required: true },
  confidenceScore: { type: Number, required: true },
  correctnessScore: { type: Number, required: true },
  bodyLanguageScore: { type: Number, required: true },
  // AI-generated feedback for this specific answer
  aiFeedback: {
    type: String,
  },
}, { timestamps: true });

const QuestionResponse = mongoose.model("QuestionResponse", questionResponseSchema);
export default QuestionResponse;