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

export default function Signup() {
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
          Create Account
        </h2>
        <p className="text-gray-400 text-sm">
          Join us to start your interview preparation journey.
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-5"
        variants={itemVariants}
      >
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full bg-white/5 border border-white/10 rounded-xl 
                     px-4 py-3 text-white
                     placeholder:text-gray-600
                     focus:ring-1 focus:ring-white/50 focus:border-white/50 focus:outline-none transition-all"
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full bg-white/5 border border-white/10 rounded-xl 
                     px-4 py-3 text-white
                     placeholder:text-gray-600
                     focus:ring-1 focus:ring-white/50 focus:border-white/50 focus:outline-none transition-all"
          required
        />
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
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </motion.form>

      {/* "Login" Link */}
      <motion.p
        className="mt-8 text-sm text-gray-400 text-center"
        variants={itemVariants}
      >
        Already have an account?{" "}
        <Link to="/login" className="text-white font-medium hover:underline">
          Login
        </Link>
      </motion.p>
    </motion.div>
  );
}