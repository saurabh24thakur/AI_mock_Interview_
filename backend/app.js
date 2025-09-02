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
app.use(cors());
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
