import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App";
import { motion } from "framer-motion"; // Import motion for animation

function AddInterview({ onClose }) {
  const [formData, setFormData] = useState({
    experience: "",
    description: "",
    expertise: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Your existing functions (handleChange, handleSubmit) are unchanged
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Submit triggered with data:", formData);
    setIsLoading(true);

    try {
      // Your existing API call logic
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo) {
        alert("⚠️ You must be logged in first.");
        navigate("/login");
        return;
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(
        `${serverURL}/api/interviews/generate-from-jd`,
        formData,
        config
      );

      if (data.questions && data.questions.length > 0) {
        alert("✅ Interview questions generated successfully!");
        onClose(); // close modal
        navigate("/interview", { state: { questions: data.questions, jobRole: formData.expertise } });
      } else {
        throw new Error("No questions were generated.");
      }
    } catch (err) {
      console.error("❌ Error generating interview:", err);
      if (err.response?.status === 401) {
        alert("Your session expired. Please log in again.");
        navigate("/login");
      } else {
        alert("Failed to generate interview. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Animation for the modal
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  return (
    // 1. MODAL OVERLAY: Darker with a slight blur
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm 
                 flex items-center justify-center z-50 p-4"
    >
      {/* 2. "GLASS" MODAL BOX */}
      <motion.div
        className="bg-gray-900/70 backdrop-blur-lg 
                   border border-white/10 shadow-xl
                   rounded-3xl w-full max-w-lg p-8 relative"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* 3. CLOSE BUTTON (Dark theme) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 4. TITLE (Lime green accent) */}
        <h2 className="text-3xl font-bold text-lime-400 mb-6">
          Add Interview
        </h2>

        {/* 5. FORM (Dark theme) */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Job Experience */}
          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Job Experience (in years)
            </label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="e.g. 3"
              required
              className="w-full bg-white/5 border border-gray-600 rounded-lg 
                         px-4 py-3 text-white
                         placeholder:text-gray-500
                         focus:ring-2 focus:ring-lime-400 focus:border-lime-400 focus:outline-none"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Job Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write a short job description..."
              rows="3"
              required
              className="w-full bg-white/5 border border-gray-600 rounded-lg 
                         px-4 py-3 text-white
                         placeholder:text-gray-500
                         focus:ring-2 focus:ring-lime-400 focus:border-lime-400 focus:outline-none"
            ></textarea>
          </div>

          {/* Expertise Details */}
          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Expertise Details
            </label>
            <input
              type="text"
              name="expertise"
              value={formData.expertise}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, System Design"
              required
              className="w-full bg-white/5 border border-gray-600 rounded-lg 
                         px-4 py-3 text-white
                         placeholder:text-gray-500
                         focus:ring-2 focus:ring-lime-400 focus:border-lime-400 focus:outline-none"
            />
          </div>

          {/* 6. SUBMIT BUTTON (Lime green) */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-lime-400 text-black font-semibold px-6 py-3 
                         rounded-full shadow-lg 
                         hover:bg-lime-300 transition-all 
                         transform hover:scale-105
                         disabled:bg-gray-600 disabled:text-gray-400 
                         disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Generating..." : "Save Interview"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default AddInterview;