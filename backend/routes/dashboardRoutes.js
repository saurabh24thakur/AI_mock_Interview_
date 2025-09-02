// FILE: backend/routes/dashboardRoutes.js

import express from "express";
const router = express.Router();
import { getDashboardData } from "../controller/dashboardController.js";
import protect from "../middleware/authMiddleware.js"; // Your authentication middleware

// This single, protected endpoint is all the dashboard needs.
router.route("/").get(protect, getDashboardData);

export default router;