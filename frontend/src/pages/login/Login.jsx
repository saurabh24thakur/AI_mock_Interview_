import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { serverURL } from "../../App";
import { motion } from "framer-motion"; // 1. Import motion

// --- Animation Variants for form items ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 100 }
  }
};

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- Your existing logic is unchanged ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        `${serverURL}/api/users/login`,
        formData
      );
      alert("✅ Login successful!");
      console.log(res.data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      alert("❌ Login failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 2. THIS IS THE NEW RETURN STATEMENT
  // It only contains the form, designed to fit in the AuthLayout
  return (
    <motion.div
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 3. Title (Restyled) */}
      <motion.h2 
        className="text-3xl font-bold text-lime-400 mb-8 text-center"
        variants={itemVariants}
      >
        Welcome Back
      </motion.h2>

      {/* 4. Form (Restyled) */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-5"
        variants={itemVariants} // This will apply to the whole form as one item
      >
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

        {/* 5. Button (Restyled) */}
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
          {loading ? "Logging in..." : "Login"}
        </button>
      </motion.form>

      {/* 6. "Sign Up" Link (Restyled) */}
      <motion.p 
        className="mt-6 text-sm text-gray-300 text-center"
        variants={itemVariants}
      >
        Don’t have an account?{" "}
        <Link to="/signup" className="text-lime-400 font-medium hover:underline">
          Sign Up
        </Link>
      </motion.p>
    </motion.div>
  );
}