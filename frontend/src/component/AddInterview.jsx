// FILE: frontend/src/components/AddInterview.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App";

function AddInterview({ onClose }) {
  const [formData, setFormData] = useState({
    experience: "",
    description: "",
    expertise: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Track input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Submit triggered with data:", formData);
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
        onClose(); // close modal
        navigate("/interview", { state: { questions: data.questions } });
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      {/* Modal Box */}
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-blue-600 mb-6">
          Add Interview
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Experience */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Job Experience (in years)
            </label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="e.g. 3"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Job Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write a short job description..."
              rows="3"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Expertise Details */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Expertise Details
            </label>
            <input
              type="text"
              name="expertise"
              value={formData.expertise}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, System Design"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Generating..." : "Save Interview"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddInterview;
