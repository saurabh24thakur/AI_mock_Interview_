import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js"; // future
import dashboardRoutes from "./routes/dashboardRoutes.js"; // future

dotenv.config();
connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  'https://ai-mock-interview-frontend-2.pages.dev',
  /^https:\/\/.*\.ai-mock-interview-frontend-2\.pages\.dev$/, // Matches any subdomain
  'http://localhost:5173' // For local development
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

// API Routes
app.use("/api/users", userRoutes); // signup, login, profile etc.
app.use("/api/interviews", interviewRoutes); // save interview sessions
app.use("/api/dashboard", dashboardRoutes);  // performance reports

// Default Route
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));