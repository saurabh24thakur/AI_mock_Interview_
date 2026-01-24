import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUploadCloud, FiFileText, FiX, FiCpu } from "react-icons/fi";
import axios from "axios";
import { serverURL } from "../App";
import { useNavigate } from "react-router-dom";

const ResumeUploadModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Please upload a PDF file.");
    }
  };

  const handleSubmit = async () => {
    if (!file || !jobDescription) {
      alert("Please provide both a resume and a job description.");
      return;
    }

    setIsGenerating(true);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo ? userInfo.token : null;

      const { data } = await axios.post(
        `${serverURL}/api/interviews/generate-from-resume`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Navigate to interview page with the generated question
      navigate("/interview", {
        state: {
          questions: [data.question],
          jobRole: "Custom Resume-Based",
          topic: data.topic,
          difficulty: data.difficulty,
        },
      });
      onClose();
    } catch (error) {
      console.error("Error generating question:", error);
      alert("Failed to generate question. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-gray-400 hover:text-white transition-colors"
            >
              <FiX size={24} />
            </button>

            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white shadow-lg">
                <FiCpu size={32} />
              </div>
              <h2 className="text-3xl font-bold text-white">AI Resume Interview</h2>
              <p className="mt-2 text-gray-400">
                Upload your resume and provide a JD to get a tailored technical question.
              </p>
            </div>

            <div className="space-y-6">
              {/* File Upload Area */}
              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Upload Resume (PDF)
                </label>
                <div
                  className={`group relative flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
                    file
                      ? "border-white/40 bg-white/5"
                      : "border-white/10 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {file ? (
                    <div className="flex items-center gap-3 text-white">
                      <FiFileText size={24} className="text-blue-400" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <FiUploadCloud size={32} className="mb-2 group-hover:text-white transition-colors" />
                      <span className="text-sm">Click or drag to upload PDF</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Description Area */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="h-32 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white placeholder-gray-600 outline-none transition-all focus:border-white/20 focus:bg-white/10"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isGenerating || !file || !jobDescription}
                className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-bold transition-all ${
                  isGenerating || !file || !jobDescription
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/10"
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
                    Scanning Resume...
                  </>
                ) : (
                  "Generate Custom Question"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ResumeUploadModal;
