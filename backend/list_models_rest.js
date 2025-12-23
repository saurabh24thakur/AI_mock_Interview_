import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
// Using v1beta as that is what the SDK likely uses by default or is the most common
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Fetching models from API...");

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      console.log("✅ Available Models (supported for generateContent):");
      data.models.forEach(m => {
        // Filter for models that support content generation
        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
             console.log(`- ${m.name}`);
        }
      });
    } else {
      console.log("❌ Failed to list models:", JSON.stringify(data, null, 2));
    }
  })
  .catch(err => console.error("❌ Error:", err));
