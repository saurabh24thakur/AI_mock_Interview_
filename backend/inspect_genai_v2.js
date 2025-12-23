import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

console.log("Type of genAI.models:", typeof genAI.models);
if (genAI.models) {
    console.log("Keys of genAI.models:", Object.keys(genAI.models));
    console.log("Type of genAI.models.list:", typeof genAI.models.list);
    console.log("Type of genAI.models.get:", typeof genAI.models.get);
}

try {
    if (typeof genAI.models.list === 'function') {
        console.log("Calling genAI.models.list()...");
        genAI.models.list().then(res => {
            console.log("List success:", JSON.stringify(res, null, 2));
        }).catch(err => {
            console.error("List failed:", err);
        });
    } else {
        console.log("genAI.models.list is NOT a function");
    }
} catch (e) {
    console.error("Error accessing models:", e);
}
