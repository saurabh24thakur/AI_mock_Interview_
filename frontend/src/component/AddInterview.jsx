import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App";
import { motion } from "framer-motion";

function AddInterview({ onClose }) {
  const [formData, setFormData] = useState({
    experience: "",
    description: "",
    expertise: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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
        onClose();
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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm 
                 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        className="bg-black/80 backdrop-blur-xl 
                   border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)]
                   rounded-[2rem] w-full max-w-lg p-8 relative"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-white mb-2">
          Add Interview
        </h2>
        <p className="text-gray-400 text-sm mb-8">
          Configure your interview settings below.
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Job Experience */}
          <div>
            <label className="block text-gray-300 font-medium mb-1 text-sm">
              Job Experience (in years)
            </label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="e.g. 3"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl 
                         px-4 py-3 text-white
                         placeholder:text-gray-600
                         focus:ring-1 focus:ring-white/50 focus:border-white/50 focus:outline-none transition-all"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-gray-300 font-medium mb-1 text-sm">
              Job Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write a short job description..."
              rows="3"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl 
                         px-4 py-3 text-white
                         placeholder:text-gray-600
                         focus:ring-1 focus:ring-white/50 focus:border-white/50 focus:outline-none transition-all"
            ></textarea>
          </div>

          {/* Expertise Details */}
          <div>
            <label className="block text-gray-300 font-medium mb-1 text-sm">
              Expertise Details
            </label>
            <input
              type="text"
              name="expertise"
              value={formData.expertise}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, System Design"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl 
                         px-4 py-3 text-white
                         placeholder:text-gray-600
                         focus:ring-1 focus:ring-white/50 focus:border-white/50 focus:outline-none transition-all"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-white text-black font-bold px-8 py-3 
                         rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)]
                         hover:bg-gray-200 transition-all 
                         transform hover:scale-105 active:scale-95
                         disabled:bg-gray-800 disabled:text-gray-500 
                         disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
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