import Interview from "../models/Interview.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Save performance report
export const saveInterview = async (req, res) => {
  try {
    // The user's ID now comes securely from the 'protect' middleware.
    // We no longer trust the 'userId' from the request body.
    const userId = req.user._id; 

    const { fluencyScore, confidenceScore, correctnessScore, bodyLanguageScore, jobRole, difficulty } = req.body;

    if (!fluencyScore || !confidenceScore || !correctnessScore || !bodyLanguageScore || !jobRole) {
      return res.status(400).json({ message: "❌ Missing required score fields or job role" });
    }

    const interview = new Interview({
      user: userId, // This is now a proper ObjectId, which fixes the core problem.
      fluencyScore,
      confidenceScore,
      correctnessScore,
      bodyLanguageScore,
      jobRole,
      difficulty,
    });

    await interview.save();
    res.status(201).json({ message: "✅ Interview saved successfully", interview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while saving interview" });
  }
};


// Get all interviews for a user
export const getUserInterviews = async (req, res) => {
  try {
    // Finds interviews based on the authenticated user's ID from the token.
    const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(interviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching interviews" });
  }
};


// This is a dummy AI function. Replace this with your actual AI service calls.
const performDummyAIAnalysis = async (audioFilePath, questionText) => {
  console.log(`AI is "analyzing" ${audioFilePath} for question: "${questionText}"`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000)); 
  
  // Return a structured response
  return {
    fluency: `Speaking pace was clear and consistent.`,
    correctness: `The answer correctly identified key concepts related to the question.`,
    transcript: "This is a simulated transcript from the AI model."
  };
};


export const analyzeAnswer = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio file was uploaded." });
    }
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ message: "The question is missing from the request." });
    }

    const analysisResult = await performDummyAIAnalysis(req.file.path, question);
    
    res.status(200).json(analysisResult);
  } catch (err) {
    console.error("Analysis controller error:", err);
    res.status(500).json({ message: "Server error during audio analysis." });
  }
};


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateQuestions = async (req, res) => {
  try {
    const { jobRole, difficulty } = req.body;

    if (!jobRole || !difficulty) {
      return res.status(400).json({ message: "Job role and difficulty are required." });
    }

    // --- Prompt Engineering ---
    // This prompt is designed to get a clean, parsable JSON output from the AI.
    const prompt = `
      Generate 5 interview questions for a candidate applying for the role of a "${jobRole}" at a "${difficulty}" level.
      The questions should cover a mix of technical, behavioral, and situational topics relevant to this role.
      
      IMPORTANT: Provide the output ONLY as a JSON array of strings. Do not include any introductory text, explanations, or markdown formatting like \`\`\`json.
      
      Example of expected output:
      ["What is the difference between state and props in React?", "Describe a time you had a conflict with a team member and how you resolved it.", "How would you design a scalable database for a social media application?"]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean and parse the response
    let questionsArray;
    try {
      questionsArray = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      return res.status(500).json({ message: "Failed to parse AI response. The format was invalid." });
    }

    res.status(200).json({ questions: questionsArray });

  } catch (error) {
    console.error("Error generating questions with Gemini:", error);
    res.status(500).json({ message: "Server error while generating questions." });
  }
};


export const generateQuestionsFromJD = async (req, res) => {
  try {
    const { experience, description, expertise } = req.body;
    console.log( experience, description, expertise)

    if (!experience || !description || !expertise) {
      return res.status(400).json({ message: "Experience, description, and expertise are required fields." });
    }

    // --- Advanced Prompt Engineering ---
    // This prompt leverages the detailed context provided by the user for superior questions.
    const prompt = `
      Act as a senior hiring manager. You are creating an interview for a candidate with the following profile:
      - Years of Experience: ${experience}
      - Their Key Skills: ${expertise}
      - The Job Description they are applying for is: "${description}"

      Based on all this information, generate 7 diverse interview questions. The questions should be a mix of:
      1. Technical questions related to the required skills.
      2. Behavioral questions to assess their experience.
      3. Situational or problem-solving questions.
      
      IMPORTANT: Provide the output ONLY as a clean JSON array of strings, without any extra text, comments, or markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    let questionsArray;
    try {
      // Clean the response in case the AI adds markdown backticks
      const cleanedText = rawText.replace(/```json\n?|\n?```/g, '');
      questionsArray = JSON.parse(cleanedText);
      console.log(cleanedText)
    } catch (e) {
      console.error("Failed to parse Gemini response:", rawText);
      return res.status(500).json({ message: "Failed to parse AI response. The format was invalid." });
    }

    res.status(200).json({ questions: questionsArray });

  } catch (error) {
    console.error("Error in generateQuestionsFromJD:", error);
    res.status(500).json({ message: "Server error while generating detailed questions." });
  }
};