import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { serverURL } from "../../App"; 


import { motion } from "framer-motion";

// --- Animation Variants for form items (Your code, untouched) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 } // Staggers each item
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 100 }
  }
};

export default function Signup() {
  // --- Your state and logic, untouched ---
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        `${serverURL}/api/users/signup`,
        formData
      );
      alert("✅ Signup successful!");
      console.log(res.data);
      localStorage.setItem("userInfo", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      alert("❌ Signup failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // --- THIS IS THE UPDATED RETURN STATEMENT ---
  // It includes the full-page layout wrappers around your original form.
  return (
    // 1. FULL PAGE WRAPPER: Creates dark background and centers content
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-900 text-white p-4">

      {/* 2. LAYOUT BOX: The centered card. */}
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-xl">

        {/* 3. YOUR ORIGINAL RETURN CONTENT: Pasted here, untouched */}
        <motion.div
          className="w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Title (Restyled) */}
          <motion.h2
            className="text-3xl font-bold text-lime-400 mb-8 text-center"
            variants={itemVariants}
          >
            Create Account
          </motion.h2>

          {/* Form (Restyled) */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            variants={itemVariants} // The form and its contents will animate in as one block
          >
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-white/5 border border-gray-600 rounded-lg 
                         px-4 py-3 text-white
                         placeholder:text-gray-500
                         focus:ring-2 focus:ring-lime-400 focus:border-lime-400 focus:outline-none"
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-white/5 border border-gray-600 rounded-lg 
                         px-4 py-3 text-white
                         placeholder:text-gray-500
                         focus:ring-2 focus:ring-lime-400 focus:border-lime-400 focus:outline-none"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white/5 border border-gray-600 rounded-lg 
                         px-4 py-3 text-white
                         placeholder:text-gray-500
                         focus:ring-2 focus:ring-lime-400 focus:border-lime-400 focus:outline-none"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-white/5 border border-gray-600 rounded-lg 
                         px-4 py-3 text-white
                         placeholder:text-gray-500
                         focus:ring-2 focus:ring-lime-400 focus:border-lime-400 focus:outline-none"
              required
            />

            {/* Button (Restyled) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime-400 text-black font-semibold px-6 py-3 
                         rounded-full shadow-lg 
                         hover:bg-lime-300 transition-all 
                         transform hover:scale-105
                         disabled:bg-gray-600 disabled:text-gray-400 
                         disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </motion.form>

          {/* "Login" Link (Restyled) */}
          <motion.p
            className="mt-6 text-sm text-gray-300 text-center"
            variants={itemVariants}
          >
            Already have an account?{" "}
            <Link to="/login" className="text-lime-400 font-medium hover:underline">
              Login
            </Link>
          </motion.p>
        </motion.div>
        {/* End of your original content */}

      </div> {/* End of layout box */}
    </div> /* End of full page wrapper */
  );
}