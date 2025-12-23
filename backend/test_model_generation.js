import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testModel(modelName) {
    console.log(`Testing model: ${modelName}...`);
    try {
        const result = await genAI.models.generateContent({
            model: modelName,
            contents: [{ role: "user", parts: [{ text: "Hello, are you working?" }] }],
        });
        console.log(`✅ ${modelName} SUCCESS`);
        // console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error(`❌ ${modelName} FAILED:`, error.message);
        if (error.response) {
             // console.error("Response:", await error.response.text());
        }
    }
}

async function runTests() {
    await testModel("gemini-1.5-flash");
    await testModel("gemini-1.5-flash-001");
    await testModel("gemini-pro");
    await testModel("models/gemini-1.5-flash");
}

runTests();
