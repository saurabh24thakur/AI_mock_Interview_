import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is missing in .env");
  process.exit(1);
}

console.log("✅ API Key found (length: " + apiKey.length + ")");

const genAI = new GoogleGenAI({ apiKey: apiKey });

async function listModels() {
  try {
    console.log("Fetching available models...");
    const response = await genAI.models.list();
    
    // The response structure might be { models: [...] } or just an array or something else
    // Let's print the keys to be safe
    console.log("Response keys:", Object.keys(response));
    
    if (response.models) {
        console.log("Models found:");
        response.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
    } else {
        console.log("Full Response:", JSON.stringify(response, null, 2));
    }

  } catch (error) {
    console.error("❌ Error listing models:", error);
    if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", await error.response.text());
    }
  }
}

listModels();
