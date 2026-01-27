import express from "express";
import {
  saveInterview,
  getUserInterviews,
  analyzeAnswer,
  generateQuestions,
  generateQuestionsFromJD,
  generateResumeQuestion,
} from "../controller/interviewController.js";
import protect from "../middleware/authMiddleware.js";
import multer from "multer";

// Configure multer for memory storage (Vercel has a read-only filesystem)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// --- Routes ---
router.post("/analyze", protect, analyzeAnswer);
router.post("/save", protect, saveInterview);
router.get("/", protect, getUserInterviews);
router.post("/generate-questions", protect, generateQuestions);
router.post("/generate-from-jd", protect, generateQuestionsFromJD);
router.post("/generate-from-resume", protect, upload.single("resume"), generateResumeQuestion);

export default router;
