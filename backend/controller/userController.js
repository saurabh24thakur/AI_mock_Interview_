import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), username: user.username, type: user.type || "student" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


// --- SIGNUP ---
export const registerUser = async (req, res) => {
  const { name, email, password, username, type } = req.body;

  try {
    // check if email or username already exist
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      if (userExists.email === email) {
        return res.status(400).json({ message: "Email already exists" });
      }
      if (userExists.username === username) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    // NOTE: password hashing is handled by pre("save") in schema
    const user = await User.create({
      name,
      email,
      username,
      password, // schema hook will hash
      type: type || "student",
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        type: user.type,
        token: generateToken(user), // ✅ correct token
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- LOGIN ---
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "❌ Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "❌ Invalid credentials" });

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      type: user.type,
      token: generateToken(user), // ✅ correct token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- GET USER BY ID (admin or public profile view) ---
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Get user profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- GET LOGGED-IN USER PROFILE ---
export const getLoggedInUserProfile = async (req, res) => {
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};
