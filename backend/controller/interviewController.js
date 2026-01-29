
import Interview from "../models/Interview.js";
import InterviewSession from "../models/interviewSession.model.js";
import generateFeedback from "../utils/feedbackGenerator.js"; 
import Groq from "groq-sdk";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import fs from "fs";

// ==================== GROQ SETUP ====================
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Helper: Generate with Groq (Cost-Effective & Fast)
async function generateWithGroq(messages, retries = 2) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Please add it to your .env file.");
  }

  for (let i = 0; i <= retries; i++) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: messages,
        response_format: { type: "json_object" },
      });
      return completion.choices[0].message.content;
    } catch (error) {
      if ((error.status === 429 || error.status === 503) && i < retries) {
        const delay = 1000 * (i + 1);
        console.warn(`Groq Rate Limit hit. Retrying in ${delay / 1000}s...`);
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

    // Generate AI feedback based on answers
    let feedback = "";
    try {
      const feedbackPrompt = `
        You are an expert technical interviewer. Based on the following interview results, provide a concise (3-4 sentences) personalized summary of the candidate's performance, highlighting strengths and areas for improvement.
        
        Job Role: ${jobRole}
        Overall Score: ${overallScore}
        Answers: ${JSON.stringify(answers)}
        
        Return ONLY a JSON object: { "summary": "your feedback summary here" }
      `;
      
      const rawFeedback = await generateWithGroq([
        { role: "system", content: "You are a helpful AI interviewer that outputs JSON." },
        { role: "user", content: feedbackPrompt }
      ]);
      
      const parsedFeedback = cleanAndParseJSON(rawFeedback, false);
      feedback = parsedFeedback.summary || generateFeedback({
        fluency: finalFluencyScore,
        confidence: finalConfidenceScore,
        correctness: finalCorrectnessScore,
        bodyLanguage: finalBodyLanguageScore,
      });
    } catch (e) {
      console.error("Failed to generate AI feedback summary:", e);
      feedback = generateFeedback({
        fluency: finalFluencyScore,
        confidence: finalConfidenceScore,
        correctness: finalCorrectnessScore,
        bodyLanguage: finalBodyLanguageScore,
      });
    }

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
    You are a strict and professional AI technical interviewer. Evaluate the following answer critically.
    
    Question: ${question}
    Answer: ${transcript}
    
    Scoring Rubric (0-100):
    - 0: No answer, completely irrelevant (e.g., "I don't know", "pizza"), or gibberish.
    - 1-30: Poor. Major misunderstandings, very brief, or lacks any technical depth.
    - 31-60: Fair. Basic understanding but lacks detail, has some inaccuracies, or poor communication.
    - 61-85: Good. Solid understanding, mostly correct, clear communication.
    - 86-100: Excellent. Comprehensive, accurate, professional, and insightful.
    
    Provide the output in the following JSON format ONLY:
    {
      "fluency": "Brief evaluation of fluency (2-3 sentences)",
      "correctness": "Brief evaluation of correctness (2-3 sentences)",
      "fluencyScore": <number 0-100>,
      "correctnessScore": <number 0-100>
    }
  `;

  try {
    const rawText = await generateWithGroq([
        { role: "system", content: "You are a critical AI interviewer that outputs JSON. You do not give high scores for poor or irrelevant answers." },
        { role: "user", content: prompt }
    ]);

    console.log(" AI Analysis Result:", rawText);
    return cleanAndParseJSON(rawText, false);
  } catch (e) {
    console.error("Failed to parse analysis JSON:", e);
    return {
      fluency: "Could not analyze fluency.",
      correctness: "Could not analyze correctness.",
      fluencyScore: 0,
      correctnessScore: 0
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

    //  Generate with Groq
    const raw = await generateWithGroq([
        { role: "system", content: "You are a helpful AI assistant that outputs JSON." },
        { role: "user", content: prompt }
    ]);

    console.log("🔹 Groq raw output (generateQuestions):", raw);

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

    // Call Groq
    const raw = await generateWithGroq([
        { role: "system", content: "You are a helpful AI assistant that outputs JSON." },
        { role: "user", content: prompt }
    ]);

    console.log("🔹 Groq raw output (generateQuestionsFromJD):", raw);

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

// ==================== GENERATE RESUME-BASED QUESTION ====================

export const generateResumeQuestion = async (req, res) => {
  console.log("generateResumeQuestion started.");

  try {
    const { jobDescription } = req.body;
    console.log("Job Description received:", jobDescription?.substring(0, 50) + "...");

    // Basic validation to ensure we have what we need
    if (!req.file) {
      console.error(" No file uploaded.");
      return res.status(400).json({ message: "Resume PDF is required." });
    }
    if (!jobDescription) {
      console.error(" No job description provided.");
      return res.status(400).json({ message: "Job description is required." });
    }

    let resumeText = "";
    try {
      console.log("Reading PDF from buffer...");
      const data = await pdf(req.file.buffer);
      resumeText = data.text;
      console.log(" PDF parsed successfully. Text length:", resumeText.length);
    } catch (pdfError) {
      console.error(" PDF Parsing Error:", pdfError);
      // If PDF fails, we don't want to break the whole flow, but we need some text.
      resumeText = "Could not extract text from resume.";
    }

    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY is missing. Using fallback question.");
      throw new Error("GROQ_API_KEY missing");
    }

    console.log("Sending request to Groq...");
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a technical interviewer. Ask a specific question connecting the candidate's resume projects/skills to the job description. Return ONLY a JSON object: { \"question\": string, \"topic\": string, \"difficulty\": string }."
        },
        {
          role: "user",
          content: `Resume Text: ${resumeText}\n\nJob Description: ${jobDescription}`
        }
      ],
      model: "llama-3.1-8b-instant", 
      response_format: { type: "json_object" },
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    console.log("Groq response received:", responseContent);
    
    // Parse the JSON response from Groq using the helper for robustness
    let result;
    try {
      result = cleanAndParseJSON(responseContent, false);
      console.log(" JSON parsed successfully:", result);
    } catch (parseError) {
      console.error(" Groq JSON Parse Error:", parseError);
      throw new Error("Failed to parse AI response");
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error(" Error in generateResumeQuestion:", error);

    
    console.log("Returning fallback question.");
    return res.status(200).json({
      question: "Can you walk me through one of the most challenging technical projects listed on your resume and how it relates to the requirements of this role?",
      topic: "General Experience",
      difficulty: "Medium"
    });
  }
};