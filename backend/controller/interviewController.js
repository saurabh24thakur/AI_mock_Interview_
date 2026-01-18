
import Interview from "../models/Interview.js";
import OpenAI from "openai";
import InterviewSession from "../models/interviewSession.model.js";
import generateFeedback from "../utils/feedbackGenerator.js"; 

// ==================== OPENROUTER SETUP ====================
const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: apiKey || "dummy-key-to-prevent-crash", // Fallback to prevent startup crash
});

// Helper: Retry mechanism for Rate Limits / Errors
async function generateWithRetry(messages, retries = 3) {
  if (!apiKey || apiKey === "dummy-key-to-prevent-crash") {
      throw new Error("OpenRouter API Key is missing. Please add OPENROUTER_API_KEY to your .env file.");
  }

  for (let i = 0; i <= retries; i++) {
    try {
      const completion = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini", 
        messages: messages,
        response_format: { type: "json_object" }, 
      });
      return completion.choices[0].message.content;
    } catch (error) {
      if ((error.status === 429 || error.status === 503) && i < retries) {
        const delay = 2000 * (i + 1); 
        console.warn(`⚠️ Rate limit/Error hit (${error.status}). Retrying in ${delay / 1000}s... (Attempt ${i + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// Helper: Clean and Parse JSON
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


// ==================== ANALYZE TEXT ANSWER ====================
async function performAnalysis(question, transcript) {
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

  try {
    const rawText = await generateWithRetry([
        { role: "system", content: "You are a helpful AI interviewer that outputs JSON." },
        { role: "user", content: prompt }
    ]);

    console.log(" AI Analysis Result:", rawText);
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
    const { question, answer } = req.body;
    
    console.log(" Backend Received Analysis Request:");
    console.log("   Question:", question);
    console.log("   Answer:", answer);

    if (!question || !answer) {
      return res.status(400).json({ message: "Question and answer text are required." });
    }

    // Direct analysis of the provided text answer
    const analysis = await performAnalysis(question, answer);

    res.status(200).json({
      user: req.user._id,
      question,
      transcript: answer, 
      analysis,
    });
  } catch (err) {
    console.error("Analysis controller error:", err);
    res.status(500).json({ message: "Server error during AI analysis" });
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
      Generate exactly 1 interview question for "${jobRole}" at "${difficulty}" level.
      The question can be technical, behavioral, or situational.
      Output ONLY JSON array of strings containing that single question.
    `;

    //  Generate with OpenRouter
    const raw = await generateWithRetry([
        { role: "system", content: "You are a helpful AI assistant that outputs JSON." },
        { role: "user", content: prompt }
    ]);

    console.log("🔹 LLM raw output (generateQuestions):", raw);

    let questionsArray;
    try {
      const parsed = cleanAndParseJSON(raw, true);
      // Handle case where AI wraps array in an object key
      if (!Array.isArray(parsed) && typeof parsed === 'object') {
          const possibleKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
          questionsArray = possibleKey ? parsed[possibleKey] : [];
      } else {
          questionsArray = parsed;
      }
    } catch (e) {
      console.error("Failed to parse AI response:", raw);
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

      Generate exactly 1 interview question (technical, behavioral, or situational).
      Output ONLY a JSON array of strings containing that single question. Example: ["Question 1"]
    `;

    // Call OpenRouter
    const raw = await generateWithRetry([
        { role: "system", content: "You are a helpful AI assistant that outputs JSON." },
        { role: "user", content: prompt }
    ]);

    console.log("🔹 AI raw output (generateQuestionsFromJD):", raw);

    let questionsArray;
    try {
      const parsed = cleanAndParseJSON(raw, true);
      // Handle case where AI wraps array in an object key
      if (!Array.isArray(parsed) && typeof parsed === 'object') {
          const possibleKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
          questionsArray = possibleKey ? parsed[possibleKey] : [];
      } else {
          questionsArray = parsed;
      }
    } catch (e) {
      console.error("Failed to parse AI response:", raw);
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