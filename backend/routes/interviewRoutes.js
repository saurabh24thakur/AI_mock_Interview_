import express from "express";
import multer from "multer";
import {
  saveInterview,
  getUserInterviews,
  analyzeAnswer,
  generateQuestions,
  generateQuestionsFromJD,
} from "../controller/interviewController.js";

// Optioal: Import your authentication middleware
import  protect  from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Create a unique filename
  },
});

const upload = multer({ storage });

// Analyze a single interview answer audio file.
// The middleware looks for a file with the key "audio" in the form data.
router.post("/analyze", protect, upload.single("audio"), analyzeAnswer);

// Save a final interview report after the session.
router.post("/save",  protect,  saveInterview);

// Get all interviews for the authenticated user.
router.get("/", protect,  getUserInterviews);

router.post("/generate-questions",  protect,  generateQuestions);
router.post("/generate-from-jd",  protect,  generateQuestionsFromJD);

export default router;