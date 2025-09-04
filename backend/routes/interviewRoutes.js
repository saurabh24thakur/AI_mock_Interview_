import express from "express";
import multer from "multer";
import {
  saveInterview,
  getUserInterviews,
  analyzeAnswer,
  generateQuestions,
  generateQuestionsFromJD,
} from "../controller/interviewController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Multer storage setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure uploads/ exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// --- Routes ---
router.post("/analyze", protect, upload.single("audio"), analyzeAnswer);
router.post("/save", protect, saveInterview);
router.get("/", protect, getUserInterviews);
router.post("/generate-questions", protect, generateQuestions);
router.post("/generate-from-jd", protect, generateQuestionsFromJD);

export default router;
