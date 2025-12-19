import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { serverURL } from "../../App";
import { motion } from "framer-motion"; 

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
      alert(" Login successful!");
      console.log(res.data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      localStorage.setItem("userInfo", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      alert("❌ Login failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Title */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-400 text-sm">
          Enter your credentials to access your account.
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-5"
        variants={itemVariants}
      >
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="w-full bg-white/5 border border-white/10 rounded-xl 
                     px-4 py-3 text-white
                     placeholder:text-gray-600
                     focus:ring-1 focus:ring-white/50 focus:border-white/50 focus:outline-none transition-all"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full bg-white/5 border border-white/10 rounded-xl 
                     px-4 py-3 text-white
                     placeholder:text-gray-600
                     focus:ring-1 focus:ring-white/50 focus:border-white/50 focus:outline-none transition-all"
          required
        />

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-bold px-6 py-3 
                     rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)]
                     hover:bg-gray-200 transition-all 
                     transform hover:scale-105 active:scale-95
                     disabled:bg-gray-800 disabled:text-gray-500 
                     disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </motion.form>

      {/* "Sign Up" Link */}
      <motion.p
        className="mt-8 text-sm text-gray-400 text-center"
        variants={itemVariants}
      >
        Don’t have an account?{" "}
        <Link to="/signup" className="text-white font-medium hover:underline">
          Sign Up
        </Link>
      </motion.p>
    </motion.div>
  );
}