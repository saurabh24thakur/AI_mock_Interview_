import fs from "fs";
import Interview from "../models/Interview.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ==================== GEMINI SETUP ====================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

// ==================== TRANSCRIBE AUDIO ====================
async function transcribeAudio(filePath) {
  const audioData = fs.readFileSync(filePath);
  const base64Audio = audioData.toString("base64");

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "audio/webm", // frontend MediaRecorder default
        data: base64Audio,
      },
    },
    { text: "Transcribe this audio into plain text only." },
  ]);

  return result.response.text();
}

// ==================== GEMINI ANALYSIS ====================
async function performGeminiAnalysis(transcript, questionText) {
  const prompt = `
    You are analyzing an interview answer.

    Question: "${questionText}"
    Candidate's Answer: "${transcript}"

    Rate the candidate on a scale of 1–10 for:
    - Fluency (clarity, smoothness of speech)
    - Confidence (tone, assertiveness)
    - Correctness (how relevant & accurate the answer is)

    Also infer:
    - Inner Tone: positive | neutral | negative
    - Body Language: good | average | poor (estimate from pauses/hesitations)

    Output strictly as JSON:
    {
      "fluency": number,
      "confidence": number,
      "correctness": number,
      "innerTone": "positive | neutral | negative",
      "bodyLanguage": "good | average | poor"
    }
  `;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini response parse failed:", raw);
    return {
      fluency: 5,
      confidence: 5,
      correctness: 5,
      innerTone: "neutral",
      bodyLanguage: "average",
    };
  }
}

// ==================== ANALYZE ANSWER ====================
export const analyzeAnswer = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "❌ No audio file uploaded" });
    }

    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: "❌ Question is required" });
    }

    // Step 1: Transcribe audio
    const transcript = await transcribeAudio(req.file.path);

    // Step 2: Analyze transcript with Gemini
    const analysis = await performGeminiAnalysis(transcript, question);

    res.status(200).json({
      user: req.user._id,
      question,
      transcript,
      analysis,
    });
  } catch (err) {
    console.error("Analysis controller error:", err);
    res.status(500).json({ message: "Server error during AI analysis" });
  } finally {
    if (req.file) fs.unlinkSync(req.file.path); // cleanup
  }
};

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
      Generate 5 interview questions for "${jobRole}" at "${difficulty}" level.
      Include technical, behavioral, and situational questions.

      Output ONLY JSON array of strings.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let questionsArray;
    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      questionsArray = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      return res
        .status(500)
        .json({ message: "Invalid AI response format" });
    }

    res.status(200).json({ questions: questionsArray });
  } catch (error) {
    console.error("Error generating questions:", error);
    res
      .status(500)
      .json({ message: "Server error while generating questions." });
  }
};

// ==================== GENERATE QUESTIONS FROM JOB DESCRIPTION ====================
export const generateQuestionsFromJD = async (req, res) => {
  try {
    const { experience, description, expertise } = req.body;

    if (!experience || !description || !expertise) {
      return res
        .status(400)
        .json({ message: "Experience, description, and expertise are required" });
    }

    const prompt = `
      You are a senior hiring manager.

      Candidate profile:
      - Experience: ${experience}
      - Expertise: ${expertise}
      - Job Description: "${description}"

      Generate 7 diverse interview questions (technical, behavioral, situational).
      Output ONLY JSON array of strings.
    `;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    let questionsArray;
    try {
      const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
      questionsArray = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse Gemini response:", raw);
      return res
        .status(500)
        .json({ message: "Invalid AI response format" });
    }

    res.status(200).json({ questions: questionsArray });
  } catch (error) {
    console.error("Error in generateQuestionsFromJD:", error);
    res
      .status(500)
      .json({ message: "Server error while generating questions" });
  }
};
