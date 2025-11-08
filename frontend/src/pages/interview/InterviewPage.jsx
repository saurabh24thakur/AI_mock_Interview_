import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../../App";
import { motion } from "framer-motion"; // 1. Import Motion
import { // 2. Import Icons
  FiVideo, FiVideoOff, FiMic, FiStopCircle, FiCheckCircle 
} from "react-icons/fi";

function InterviewPage() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // --- All your State and Refs (Unchanged) ---
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [fluency, setFluency] = useState("Waiting for your response...");
  const [correctness, setCorrectness] = useState("Waiting for your response...");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusText, setStatusText] = useState(
    "Click 'Submit Answer' to start recording."
  );
  const navigate = useNavigate();

  // --- All your functions (useEffect, startCamera, stopCamera, etc.) ---
  // --- are 100% unchanged. I've just collapsed them for brevity. ---
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo ? userInfo.token : null;
        if (!token) {
          navigate("/login");
          return;
        }
        const { data } = await axios.post(
          `${serverURL}/api/interviews/generate-questions`,
          { jobRole: "Frontend Developer", difficulty: "medium" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          alert("No questions generated. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };
    fetchQuestions();
  }, [navigate]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
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
      alert("Could not access camera/microphone.");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
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
      setStatusText("Recording... Click again to stop.");
    }
  };

  const submitAudioForAnalysis = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "user-answer.webm");
    formData.append("question", questions[currentQuestionIndex]);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo ? userInfo.token : null;
      if (!token) {
        navigate("/login");
        return;
      }
      const { data } = await axios.post(
        `${serverURL}/api/interviews/analyze`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFluency(data.analysis.fluency || "Analysis complete.");
      setCorrectness(data.analysis.correctness || "Analysis complete.");
      setAnswers((prev) => [
        ...prev,
        {
          question: questions[currentQuestionIndex],
          fluency: data.analysis.fluency,
          correctness: data.analysis.correctness,
          fluencyScore: data.analysis.fluencyScore || 70,
          correctnessScore: data.analysis.correctnessScore || 70,
        },
      ]);
      setCompletedQuestions((prev) => [...prev, questions[currentQuestionIndex]]);
      setCurrentQuestionIndex((prevIndex) => {
        if (prevIndex < questions.length - 1) {
          setStatusText("Click 'Submit Answer' for next question.");
          return prevIndex + 1;
        } else {
          setStatusText("Interview complete! 🎉");
          alert("All questions answered!");
          saveInterviewToDB();
          return prevIndex;
        }
      });
    } catch (err) {
      setFluency("Error during analysis.");
      setCorrectness("Error during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveInterviewToDB = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo ? userInfo.token : null;
      if (!token) return;
      const overallScore = Math.round(
        answers.reduce((sum, a) => sum + (a.correctnessScore || 70), 0) /
          answers.length
      );
      await axios.post(
        `${serverURL}/api/interviews/save`,
        {
          jobRole: "Frontend Developer",
          answers,
          overallScore,
          finalFluencyScore: Math.round(
            answers.reduce((s, a) => s + (a.fluencyScore || 70), 0) /
              answers.length
          ),
          finalConfidenceScore: 75, // placeholder
          finalCorrectnessScore: Math.round(
            answers.reduce((s, a) => s + (a.correctnessScore || 70), 0) /
              answers.length
          ),
          finalBodyLanguageScore: 80, // placeholder
          status: "completed",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Interview saved successfully.");
    } catch (err) {
      console.error("Error saving interview:", err);
    }
  };


  // --- 3. REDESIGNED LOADING STATE ---
  if (questions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <h1 className="text-xl font-semibold">Loading Interview Questions...</h1>
      </div>
    );
  }

  // --- 4. REDESIGNED JSX ---
  return (
    <div className="flex flex-col md:flex-row h-screen bg-black text-white">
      
      
      <div className="absolute top-0 left-0 w-full h-full z-0 opacity-50">
        <div className="animated-aurora"></div>
        <style jsx>{`
          .animated-aurora {
            width: 100%;
            height: 100%;
            position: fixed;
            background: linear-gradient(-45deg, #111214 30%, #3b0764, #111214 70%);
            background-size: 400% 400%;
            animation: gradientFlow 15s ease infinite;
          }
          @keyframes gradientFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>

      {/* --- Main Content (Left side) --- */}
      <div className="relative z-10 w-full md:w-2/3 flex flex-col items-center justify-center p-8">
        <motion.h1 
          className="text-4xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Mock Interview Session
        </motion.h1>

        <motion.div 
          className="flex gap-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* User Video */}
          <div className="relative bg-gray-900/70 backdrop-blur-lg border border-white/10 rounded-2xl p-4 w-72 h-72">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full rounded-xl object-cover"
            ></video>
            <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              You
            </span>
          </div>
          {/* AI Avatar */}
          <div className="relative bg-gray-900/70 backdrop-blur-lg border border-white/10 rounded-2xl p-4 w-72 h-72 flex flex-col items-center justify-center">
            <img
              src="https://i.ibb.co/6mZ3Q9m/ai-avatar.png"
              alt="AI Interviewer"
              className="w-32 h-32 rounded-full border-2 border-lime-400"
            />
            <p className="mt-3 font-semibold text-white">AI Interviewer</p>
          </div>
        </motion.div>

        {/* Question */}
        <motion.div 
          className="mt-8 bg-gray-900/70 backdrop-blur-lg border border-white/10 rounded-xl px-6 py-4 w-full max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-gray-300">Current Question</h2>
          <p className="text-lime-400 mt-2 text-xl font-medium">
            {questions[currentQuestionIndex]}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <p className="mt-2 text-sm text-gray-400">{statusText}</p>
        </motion.div>

        {/* Controls */}
        <motion.div 
          className="flex space-x-4 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {!isCameraOn ? (
            <button onClick={startCamera} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
              <FiVideo /> Start Camera
            </button>
          ) : (
            <button onClick={stopCamera} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
              <FiVideoOff /> Stop Camera
            </button>
          )}
          <button
            onClick={handleRecordingToggle}
            disabled={isAnalyzing || !isCameraOn}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition
              ${isAnalyzing ? "bg-gray-600 text-gray-400 cursor-not-allowed" : ""}
              ${isRecording ? "bg-red-600 text-white hover:bg-red-700" : ""}
              ${!isRecording && !isAnalyzing ? "bg-lime-400 text-black hover:bg-lime-300" : ""}
              ${!isCameraOn ? "bg-gray-700 text-gray-400 cursor-not-allowed" : ""}
            `}
          >
            {isAnalyzing ? (
              "Analyzing..."
            ) : isRecording ? (
              <><FiStopCircle /> Stop & Submit</>
            ) : (
              <><FiMic /> Submit Answer</>
            )}
          </button>
        </motion.div>
      </div>

      {/* --- Feedback Sidebar (Right side) --- */}
      <div className="relative z-10 w-full md:w-1/3 p-8 bg-gray-900/70 backdrop-blur-lg border-l border-white/10 overflow-y-auto">
        <h2 className="text-2xl font-semibold text-lime-400 mb-4">Live Observations</h2>
        <div className="bg-white/5 p-4 rounded-lg shadow mb-4">
          <h3 className="font-medium text-gray-300">Fluency</h3>
          <p className="text-gray-400">{fluency}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-lg shadow mb-6">
          <h3 className="font-medium text-gray-300">Correctness</h3>
          <p className="text-gray-400">{correctness}</p>
        </div>

        <h2 className="text-lg font-semibold text-white mb-2">Completed Questions</h2>
        <ul className="space-y-2">
          {completedQuestions.map((q, i) => (
            <li key={i} className="flex items-center gap-2 text-gray-400 line-through">
              <FiCheckCircle className="text-lime-400" />
              {q}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default InterviewPage;