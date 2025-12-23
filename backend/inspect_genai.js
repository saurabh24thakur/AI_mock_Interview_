import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

console.log("genAI keys:", Object.keys(genAI));
console.log("genAI prototype keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(genAI)));

if (genAI.models) {
    console.log("genAI.models keys:", Object.keys(genAI.models));
    console.log("genAI.models prototype keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(genAI.models)));
} else {
    console.log("genAI.models is undefined");
}
