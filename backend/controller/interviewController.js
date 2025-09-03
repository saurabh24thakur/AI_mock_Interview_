import Interview from "../models/Interview.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ==================== SAVE INTERVIEW REPORT ====================
export const saveInterview = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      fluencyScore,
      confidenceScore,
      correctnessScore,
      bodyLanguageScore,
      jobRole,
      difficulty,
    } = req.body;

    if (
      !fluencyScore ||
      !confidenceScore ||
      !correctnessScore ||
      !bodyLanguageScore ||
      !jobRole
    ) {
      return res
        .status(400)
        .json({ message: "❌ Missing required score fields or job role" });
    }

    const interview = new Interview({
      user: userId,
      fluencyScore,
      confidenceScore,
      correctnessScore,
      bodyLanguageScore,
      jobRole,
      difficulty,
    });

    await interview.save();
    res
      .status(201)
      .json({ message: "✅ Interview saved successfully", interview });
  } catch (err) {
    console.error("Error in saveInterview:", err);
    res.status(500).json({ message: "Server error while saving interview" });
  }
};

// ==================== GET USER INTERVIEWS ====================
export const getUserInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(interviews);
  } catch (err) {
    console.error("Error in getUserInterviews:", err);
    res.status(500).json({ message: "Server error while fetching interviews" });
  }
};

// ==================== DUMMY AI ANALYSIS ====================
const performDummyAIAnalysis = async (audioFilePath, questionText) => {
  console.log(`AI analyzing file: ${audioFilePath} for Q: "${questionText}"`);
  await new Promise((resolve) => setTimeout(resolve, 2000)); // simulate delay
  return {
    fluency: "Speaking pace was clear and consistent.",
    correctness: "Answer correctly covered the main concepts.",
    transcript: "This is a simulated transcript from the AI model.",
  };
};

export const analyzeAnswer = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No audio file was uploaded." });
    }

    const { question } = req.body;
    if (!question) {
      return res
        .status(400)
        .json({ message: "The question is missing from the request." });
    }

    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please log in again." });
    }

    const analysisResult = await performDummyAIAnalysis(
      req.file.path,
      question
    );

    res.status(200).json({
      user: req.user._id,
      question,
      analysis: analysisResult,
    });
  } catch (err) {
    console.error("Analysis controller error:", err);
    res.status(500).json({ message: "Server error during audio analysis." });
  }
};

// ==================== GEMINI SETUP ====================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ==================== GENERATE QUESTIONS ====================
export const generateQuestions = async (req, res) => {
  try {
    const { jobRole, difficulty } = req.body;

    if (!jobRole || !difficulty) {
      return res
        .status(400)
        .json({ message: "Job role and difficulty are required." });
    }

    const prompt = `
      Generate 5 interview questions for a candidate applying for the role of "${jobRole}" at a "${difficulty}" level.
      The questions should cover a mix of technical, behavioral, and situational topics relevant to this role.
      
      IMPORTANT: Provide the output ONLY as a JSON array of strings. No intro text, no explanations, no markdown.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let questionsArray;
    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
      questionsArray = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      return res
        .status(500)
        .json({ message: "Failed to parse AI response. The format was invalid." });
    }

    res.status(200).json({ questions: questionsArray });
  } catch (error) {
    console.error("Error generating questions with Gemini:", error);
    res
      .status(500)
      .json({ message: "Server error while generating questions." });
  }
};

// ==================== GENERATE QUESTIONS FROM JOB DESCRIPTION ====================
export const generateQuestionsFromJD = async (req, res) => {
  try {
    const { experience, description, expertise } = req.body;
    console.log("JD inputs:", experience, description, expertise);

    if (!experience || !description || !expertise) {
      return res
        .status(400)
        .json({ message: "Experience, description, and expertise are required fields." });
    }

    const prompt = `
      Act as a senior hiring manager. You are creating an interview for a candidate with the following profile:
      - Years of Experience: ${experience}
      - Key Skills: ${expertise}
      - Job Description: "${description}"

      Based on this information, generate 7 diverse interview questions.
      Mix of technical, behavioral, and situational questions.
      
      IMPORTANT: Provide the output ONLY as a JSON array of strings, no extra text, no markdown.
    `;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    let questionsArray;
    try {
      const cleanedText = rawText.replace(/```json\n?|\n?```/g, "").trim();
      questionsArray = JSON.parse(cleanedText);
      console.log("Generated questions:", cleanedText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", rawText);
      return res
        .status(500)
        .json({ message: "Failed to parse AI response. The format was invalid." });
    }

    res.status(200).json({ questions: questionsArray });
  } catch (error) {
    console.error("Error in generateQuestionsFromJD:", error);
    res
      .status(500)
      .json({ message: "Server error while generating detailed questions." });
  }
};
