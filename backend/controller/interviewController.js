import fs from "fs";
import Interview from "../models/Interview.js";
import pkg from '@google/genai';
import InterviewSession from "../models/interviewSession.model.js";
const { GoogleGenAI } = pkg;

// ==================== GEMINI SETUP ====================
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


// ==================== SAVE INTERVIEW REPORT ====================
export const saveInterview = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      jobRole,
      answers,
      overallScore,
      finalFluencyScore,
      finalConfidenceScore,
      finalCorrectnessScore,
      finalBodyLanguageScore,
      status,
    } = req.body;

    const session = await InterviewSession.create({
      user: userId,
      jobRole,
      answers,
      overallScore,
      finalFluencyScore,
      finalConfidenceScore,
      finalCorrectnessScore,
      finalBodyLanguageScore,
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

  const result = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
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

  // ✅ Safely extract transcript text
  const transcript =
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    result?.candidates?.[0]?.content?.parts?.[0]?.text ||
    result?.text ||
    "";

  console.log("🎙️ Transcription Result:", transcript);

  return transcript;
}


// ==================== ANALYZE TEXT ANSWER ====================
async function performGeminiAnalysis(question, transcript) {
  const prompt = `
You are an AI interviewer. Evaluate the following answer.

Question: ${question}
Answer: ${transcript}

Provide:
1. A brief evaluation (2-3 sentences)
2. A score out of 10
3. Suggested improvements
`;

  const result = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  // ✅ Safely extract AI analysis text
  const analysisText =
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    result?.candidates?.[0]?.content?.parts?.[0]?.text ||
    result?.text ||
    "";

  console.log(" Gemini Analysis Result:", analysisText);

  return analysisText;
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

    //  Generate with Gemini
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    //  Safely extract text from multiple possible SDK response shapes
    const raw =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result?.text ||
      "undefined";

    console.log("🔹 Gemini raw output (generateQuestions):", raw);

    let questionsArray;
    try {
      const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
      questionsArray = JSON.parse(cleaned);
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

      Generate 7 diverse interview questions (technical, behavioral, situational).
      Output ONLY a JSON array of strings.
    `;

    // Call Gemini
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
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
      const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
      questionsArray = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse Gemini response:", raw);
      return res.status(500).json({ message: "Invalid AI response format" });
    }

    return res.status(200).json({ questions: questionsArray });
  } catch (error) {
    console.error("Error in generateQuestionsFromJD:", error);
    res
      .status(500)
      .json({ message: "Server error while generating questions" });
  }
};



