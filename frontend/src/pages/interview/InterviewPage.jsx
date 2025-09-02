// FILE: frontend/src/pages/InterviewPage.jsx

import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // <-- 1. IMPORTED
import axios from "axios";
import { serverURL } from "../../App";

function InterviewPage() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [fluency, setFluency] = useState("Waiting for your response...");
  const [correctness, setCorrectness] = useState("Waiting for your response...");
  
  // --- 2. STATE INITIALIZATION CHANGED ---
  const [questions, setQuestions] = useState([]);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusText, setStatusText] = useState("Click 'Submit Answer' to start recording.");

  // --- 3. ADDED useEffect TO GET QUESTIONS ---
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.questions && location.state.questions.length > 0) {
      setQuestions(location.state.questions);
    } else {
      alert("Please set up your interview first.");
      navigate("/interview-setup");
    }
  }, [location, navigate]);

  // --- All other functions (startCamera, stopCamera, etc.) remain the same ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = submitAudioForAnalysis;
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Error: Could not access your camera or microphone. Please check browser permissions.");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraOn(false);
    setIsRecording(false);
  };

  const handleRecordingToggle = () => {
    if (!isCameraOn) {
        alert("Please start your camera first.");
        return;
    }
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsAnalyzing(true);
      setStatusText("Analyzing your response...");
      setFluency("Analyzing...");
      setCorrectness("Analyzing...");
    } else {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatusText("Recording... Click again to stop and submit.");
    }
  };

  const submitAudioForAnalysis = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "user-answer.webm");
    formData.append("question", questions[currentQuestionIndex]);
    try {
      const { data } = await axios.post(`${serverURL}/api/interviews/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFluency(data.fluency || "Analysis complete.");
      setCorrectness(data.correctness || "Analysis complete.");
      const currentQ = questions[currentQuestionIndex];
      setCompletedQuestions((prev) => [...prev, currentQ]);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setStatusText("Click 'Submit Answer' to start recording for the next question.");
      } else {
        setStatusText("Interview complete! Great job.");
        alert("You have completed all questions!");
      }
    } catch (error) {
      console.error("Analysis API error:", error);
      alert("Sorry, there was an error analyzing your response.");
      setFluency("Error during analysis.");
      setCorrectness("Error during analysis.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  // --- 4. ADDED LOADING STATE ---
  if (questions.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1 className="text-2xl font-semibold text-gray-700">Loading Interview...</h1>
      </div>
    );
  }

  // --- Your JSX remains unchanged ---
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      {/* ... your entire JSX structure ... */}
       <div className="w-full md:w-2/3 flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          Mock Interview Session
        </h1>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="relative bg-white shadow-xl rounded-2xl p-4 w-72 h-72 flex flex-col items-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full rounded-xl object-cover border-2 border-blue-500"
            ></video>
            <span className="absolute bottom-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
              You (Candidate)
            </span>
          </div>
          <div className="relative bg-white shadow-xl rounded-2xl p-4 w-72 h-72 flex flex-col items-center justify-center">
            <img
              src="https://i.ibb.co/6mZ3Q9m/ai-avatar.png"
              alt="AI Interviewer"
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
            />
            <p className="mt-3 font-semibold text-gray-700">AI Interviewer</p>
            <span className="absolute bottom-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
              Interviewer
            </span>
          </div>
        </div>
        <div className="mt-8 bg-white shadow-md rounded-xl px-6 py-4 w-full max-w-2xl text-center">
          <h2 className="text-lg font-semibold text-gray-800">Current Question</h2>
          <p className="text-blue-700 mt-2 text-xl font-medium">
            {questions[currentQuestionIndex]}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          {/* New Status Text */}
          <p className="mt-2 text-sm text-gray-600 font-medium">{statusText}</p>
        </div>
        <div className="flex space-x-4 mt-6">
          {!isCameraOn ? (
            <button
              onClick={startCamera}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
            >
              Stop Camera
            </button>
          )}
          <button
            onClick={handleRecordingToggle}
            disabled={isAnalyzing || !isCameraOn} // Disable button during analysis or if camera is off
            className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? "Analyzing..." : isRecording ? "Stop & Submit" : "Submit Answer"}
          </button>
        </div>
      </div>

      {/* Right Side - Observations + Completed */}
      <div className="w-full md:w-1/3 flex flex-col justify-start p-8 bg-white shadow-inner overflow-y-auto">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">
          Live Observations
        </h2>
        <div className="bg-blue-50 p-4 rounded-lg shadow mb-4">
          <h3 className="font-medium text-gray-800">Fluency</h3>
          <p className="text-gray-600">{fluency}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow mb-6">
          <h3 className="font-medium text-gray-800">Correctness</h3>
          <p className="text-gray-600">{correctness}</p>
        </div>
        <h2 className="text-lg font-semibold text-blue-700 mb-2">
          Completed Questions
        </h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          {completedQuestions.map((q, i) => (
            <li key={i} className="line-through text-gray-500">
              {q}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default InterviewPage;