import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // Correct the path if necessary

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      // --- IMPROVEMENT ---
      // Check if the user was actually found in the database
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      // --- END IMPROVEMENT ---

      next();
    } catch (error) {
      // Return here to prevent the code below from running
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export default protect;