import React from "react";

function AddInterview({ onClose }) {
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
        <form className="space-y-4">
          {/* Job Experience */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Job Experience (in years)
            </label>
            <input
              type="number"
              placeholder="e.g. 3"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Job Description
            </label>
            <textarea
              placeholder="Write a short job description..."
              rows="3"
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
              placeholder="e.g. React, Node.js, System Design"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"
            >
              Save Interview
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddInterview;
