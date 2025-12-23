import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
  try {
    console.log("Fetching available models...");
    // The SDK structure might vary, let's try to find the list method
    // Based on documentation for @google/genai (new SDK)
    // It seems it might be genAI.models.list()
    
    const response = await genAI.models.list();
    console.log("Models:", JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
