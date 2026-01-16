import fs from "fs";
import Interview from "../models/Interview.js";
import { GoogleGenAI } from '@google/genai';
import InterviewSession from "../models/interviewSession.model.js";
import generateFeedback from "../utils/feedbackGenerator.js"; // Import the feedback generator

// ==================== GEMINI SETUP ====================
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper: Retry mechanism for 429 Rate Limits
async function generateWithRetry(params, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await genAI.models.generateContent(params);
    } catch (error) {
      // Check for 429 (Too Many Requests) or 503 (Service Unavailable)
      if ((error.status === 429 || error.code === 429 || error.status === 503) && i < retries) {
        const delay = 2000 * (i + 1); // Wait 2s, 4s, 6s
        console.warn(`⚠️ Rate limit/Error hit (${error.status}). Retrying in ${delay / 1000}s... (Attempt ${i + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// Helper: Clean and Parse JSON from Gemini Response
function cleanAndParseJSON(raw, isArray = false) {
  try {
    
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {

    const startChar = isArray ? '[' : '{';
    const endChar = isArray ? ']' : '}';
    const start = raw.indexOf(startChar);
    const end = raw.lastIndexOf(endChar);
    
    if (start !== -1 && end !== -1 && end > start) {
      const jsonStr = raw.substring(start, end + 1);
      try {
        return JSON.parse(jsonStr);
      } catch (e2) {
        console.error("Failed to parse extracted JSON:", jsonStr);
      }
    }
    throw e;
  }
}


// ==================== SAVE INTERVIEW REPORT ====================
export const saveInterview = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      jobRole,
      difficulty,
      answers,
      overallScore,
      finalFluencyScore,
      finalConfidenceScore,
      finalCorrectnessScore,
      finalBodyLanguageScore,
      status,
    } = req.body;

    // Generate feedback based on scores
    const feedback = generateFeedback({
      fluency: finalFluencyScore,
      confidence: finalConfidenceScore,
      correctness: finalCorrectnessScore,
      bodyLanguage: finalBodyLanguageScore,
    });

    const session = await InterviewSession.create({
      user: userId,
      jobRole,
      difficulty,
      answers,
      overallScore,
      finalFluencyScore,
      finalConfidenceScore,
      finalCorrectnessScore,
      finalBodyLanguageScore,
      feedback, // Save the generated feedback
      status: status || "completed",
    });

    res.status(201).json({ message: "Interview saved successfully", session });
  } catch (error) {
    console.error("Error saving interview:", error);
    res.status(500).json({ message: "Failed to save interview" });
  }
};

// ==================== GET USER INTERVIEWS ====================
export const getUserInterviews = async (req, res) => {
  try {
    const interviews = await InterviewSession.find({ user: req.user._id }).sort({
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

  const result = await generateWithRetry({
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          mimeType: "audio/webm", // frontend MediaRecorder default
          data: base64Audio,
        },
      },
      { text: "Transcribe this audio into plain text only." },
    ],
  });

  // Safely extract transcript text
  const transcript =
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    result?.candidates?.[0]?.content?.parts?.[0]?.text ||
    result?.text ||
    "";

  console.log(" Transcription Result:", transcript);

  return transcript;
}


// ==================== ANALYZE TEXT ANSWER ====================
async function performGeminiAnalysis(question, transcript) {
  const prompt = `
    You are an AI interviewer. Evaluate the following answer.
    
    Question: ${question}
    Answer: ${transcript}
    
    Provide the output in the following JSON format ONLY:
    {
      "fluency": "Brief evaluation of fluency (2-3 sentences)",
      "correctness": "Brief evaluation of correctness (2-3 sentences)",
      "fluencyScore": <number 0-100>,
      "correctnessScore": <number 0-100>
    }
  `;

  const result = await generateWithRetry({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  //  Safely extract AI analysis text
  const rawText =
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    result?.candidates?.[0]?.content?.parts?.[0]?.text ||
    result?.text ||
    "{}";

  console.log(" Gemini Analysis Result:", rawText);

  try {
    return cleanAndParseJSON(rawText, false);
  } catch (e) {
    console.error("Failed to parse analysis JSON:", e);
    return {
      fluency: "Could not analyze fluency.",
      correctness: "Could not analyze correctness.",
      fluencyScore: 50,
      correctnessScore: 50
    };
  }
}


// ==================== ANALYZE ANSWER ====================
export const analyzeAnswer = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: " No audio file uploaded -X" });
    }

    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: " Question is required -X" });
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
    if (req.file) fs.unlinkSync(req.file.path); 
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
      Generate 1 interview questions for "${jobRole}" at "${difficulty}" level.
      Include technical, behavioral, and situational questions.
      Output ONLY JSON array of strings.
    `;

    //  Generate with Gemini
    const result = await generateWithRetry({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    //  Safely extract text from multiple possible SDK response shapes
    const raw =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result?.text ||
      "undefined";

    console.log("🔹 LLM raw output (generateQuestions):", raw);

    let questionsArray;
    try {
      questionsArray = cleanAndParseJSON(raw, true);
    } catch (e) {
      console.error("Failed to parse Gemini response:", raw);
      return res.status(500).json({ message: "Invalid AI response format" });
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

      Generate 1 diverse interview questions (technical, behavioral, situational).
      Output ONLY a JSON array of strings.
    `;

    // Call Gemini
    const result = await generateWithRetry({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    //  extract text
    const raw =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result?.text ||
      "undefined";

    console.log("🔹 Gemini raw output (generateQuestionsFromJD):", raw);

    let questionsArray;
    try {
      questionsArray = cleanAndParseJSON(raw, true);
    } catch (e) {
      console.error("Failed to parse Gemini response:", raw);
      return res.status(500).json({ message: "Invalid AI response format" });
    }

    return res.status(200).json({ questions: questionsArray });
  } catch (error) {
    console.error("Error in generateQuestionsFromJD:", error);
    console.error("Full Error Details:", JSON.stringify(error, null, 2));
    res
      .status(500)
      .json({ message: "Server error while generating questions" });
  }
};