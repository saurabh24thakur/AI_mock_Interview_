import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // Correct the path if necessary

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      console.log("Authorization Header:", req.headers.authorization); // Logging header
      token = req.headers.authorization.split(" ")[1];
      console.log("Extracted Token:", token); // Logging token

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded); // Logging decoded payload

      req.user = await User.findById(decoded.id).select("-password");

      // --- IMPROVEMENT ---
      // Check if the user was actually found in the database
      if (!req.user) {
        console.log("User not found for ID:", decoded.id); // Logging user not found
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      // --- END IMPROVEMENT ---

      next();
    } catch (error) {
      console.error("Token verification failed:", error); // Logging the error
      // Return here to prevent the code below from running
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export default protect;