// FILE: backend/routes/userRoutes.js

import express from "express";
import {  loginUser, getUserProfile, registerUser , getLoggedInUserProfile } from "../controller/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Signup
router.post("/signup", registerUser);

// Login
router.post("/login", loginUser);




router.get("/profile", protect, getLoggedInUserProfile);


router.get("/:id", getUserProfile);


export default router;