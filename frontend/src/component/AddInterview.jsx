import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App";
import { motion, AnimatePresence } from "framer-motion";
import { FiFileText, FiBriefcase, FiUploadCloud, FiCheckCircle, FiX } from "react-icons/fi";

function AddInterview({ onClose }) {
  const [interviewType, setInterviewType] = useState("jd"); // "jd" or "resume"
  const [formData, setFormData] = useState({
    experience: "",
    description: "",
    expertise: "",
  });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Please upload a PDF file.");
    }
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

      const token = userInfo.token;
      let response;

      if (interviewType === "resume") {
        if (!file) {
          alert("Please upload your resume.");
          setIsLoading(false);
          return;
        }
        const uploadData = new FormData();
        uploadData.append("resume", file);
        uploadData.append("jobDescription", formData.description);

        response = await axios.post(
          `${serverURL}/api/interviews/generate-from-resume`,
          uploadData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          `${serverURL}/api/interviews/generate-from-jd`,
          formData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      const data = response.data;

      if (interviewType === "resume") {
        if (data.question) {
          alert(" Resume-based interview question generated!");
          onClose();
          navigate("/interview", { 
            state: { 
              questions: [data.question], 
              jobRole: "Resume-Based Interview",
              topic: data.topic,
              difficulty: data.difficulty
            } 
          });
        } else {
          throw new Error("Failed to generate question from resume.");
        }
      } else {
        if (data.questions && data.questions.length > 0) {
          alert(" Interview questions generated successfully!");
          onClose();
          navigate("/interview", { state: { questions: data.questions, jobRole: formData.expertise } });
        } else {
          throw new Error("No questions were generated.");
        }
      }
    } catch (err) {
      console.error("Error generating interview:", err);
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
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 },
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm 
                 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        className="bg-black/80 backdrop-blur-xl 
                   border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)]
                   rounded-[2.5rem] w-full max-w-xl p-8 relative overflow-hidden"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10"
        >
          <FiX size={24} />
        </button>

        {/* TITLE */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            Add Interview
          </h2>
          <p className="text-gray-400 text-sm">
            Choose your mode and configure settings.
          </p>
        </div>

        {/* Mode Selection Tabs */}
        <div className="flex p-1 bg-white/5 rounded-2xl mb-6 border border-white/5">
          <button
            onClick={() => setInterviewType("jd")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
              interviewType === "jd" 
                ? "bg-white text-black shadow-lg" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FiBriefcase />
            <span className="font-semibold">Job Description</span>
          </button>
          <button
            onClick={() => setInterviewType("resume")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
              interviewType === "resume" 
                ? "bg-white text-black shadow-lg" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FiFileText />
            <span className="font-semibold">Resume-Based</span>
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {interviewType === "jd" ? (
              <motion.div
                key="jd-fields"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
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
              </motion.div>
            ) : (
              <motion.div
                key="resume-fields"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* Resume Upload */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2 text-sm">
                    Upload Your Resume (PDF)
                  </label>
                  <div className={`group relative flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
                    file ? "border-white/40 bg-white/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                  }`}>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {file ? (
                      <div className="flex items-center gap-3 text-white">
                        <FiCheckCircle className="text-green-400" size={24} />
                        <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <FiUploadCloud size={32} className="mb-2 group-hover:text-white transition-colors" />
                        <span className="text-sm">Click to upload resume</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Job Description */}
          <div>
            <label className="block text-gray-300 font-medium mb-1 text-sm">
              Job Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Paste the job requirements here..."
              rows="3"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl 
                         px-4 py-3 text-white
                         placeholder:text-gray-600
                         focus:ring-1 focus:ring-white/50 focus:border-white/50 focus:outline-none transition-all resize-none"
            ></textarea>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-bold py-4 
                         rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)]
                         hover:bg-gray-200 transition-all 
                         transform hover:scale-[1.02] active:scale-[0.98]
                         disabled:bg-gray-800 disabled:text-gray-500 
                         disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  <span>Generating...</span>
                </>
              ) : (
                "Start Interview"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default AddInterview;