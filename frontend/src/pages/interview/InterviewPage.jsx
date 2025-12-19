import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../../App";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiVideo, FiVideoOff, FiMic, FiStopCircle, FiCheckCircle, FiCpu, FiUser
} from "react-icons/fi";
import DynamicBackground from "../../component/DynamicBackground";
import Avatar3D from "../../component/Avatar3D";

function InterviewPage() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const location = useLocation();

  // --- State and Refs ---
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [fluency, setFluency] = useState("Waiting for your response...");
  const [correctness, setCorrectness] = useState("Waiting for your response...");
  const [questions, setQuestions] = useState(location.state?.questions || []);
  const [jobRole, setJobRole] = useState(location.state?.jobRole || "General");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusText, setStatusText] = useState(
    "Click 'Submit Answer' to start recording."
  );
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const navigate = useNavigate();

  const handleFinishAndSave = async () => {
    await saveInterviewToDB();
    navigate("/dashboard");
  };

  useEffect(() => {
    if (!location.state?.questions) {
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
            { jobRole: jobRole, difficulty: "medium" },
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
    }
  }, [navigate, jobRole, location.state?.questions]);

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
          setStatusText("Interview complete! 🎉 Click 'Finish & Save' to view your report.");
          setIsInterviewComplete(true);
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
          jobRole: jobRole,
          answers,
          overallScore,
          finalFluencyScore: Math.round(
            answers.reduce((s, a) => s + (a.fluencyScore || 70), 0) /
              answers.length
          ),
          finalConfidenceScore: 75,
          finalCorrectnessScore: Math.round(
            answers.reduce((s, a) => s + (a.correctnessScore || 70), 0) /
              answers.length
          ),
          finalBodyLanguageScore: 80,
          status: "completed",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(" Interview saved successfully.");
    } catch (err) {
      console.error("Error saving interview:", err);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-black text-white">
        <DynamicBackground />
        <div className="z-10 flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-lime-400 border-t-transparent"></div>
          <h1 className="text-xl font-light tracking-wider text-gray-300">Initializing Interview Environment...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-black text-white font-sans selection:bg-lime-500/30">
      <DynamicBackground />

      {/* --- Main Content (Left side) --- */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center p-4 md:w-3/4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Mock Interview Session
          </h1>
          <p className="mt-2 text-sm text-gray-400 tracking-wide uppercase">
            {jobRole} • Medium Difficulty
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col md:flex-row gap-8 items-center justify-center w-full max-w-5xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* User Video Card */}
          <div className="group relative flex h-64 w-full md:w-1/2 max-w-md flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl transition-all hover:border-white/20">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
            ></video>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-md border border-white/5">
              <FiUser className="text-blue-400" />
              <span className="text-xs font-medium text-white">You</span>
            </div>
            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <p className="text-sm text-gray-400">Camera Off</p>
              </div>
            )}
          </div>

          {/* AI Avatar Card */}
          <div className="group relative flex h-64 w-full md:w-1/2 max-w-md flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl transition-all hover:border-white/20">
            <div className="absolute inset-0 bg-gradient-to-b from-lime-500/5 to-transparent opacity-50"></div>
            <div className="h-full w-full">
              <Avatar3D />
            </div>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform items-center gap-2 rounded-full bg-black/60 px-4 py-1.5 backdrop-blur-md border border-white/5">
               <FiCpu className="text-lime-400" />
              <span className="text-xs font-medium text-lime-400">AI Interviewer</span>
            </div>
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div
          className="mt-8 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <p className="mt-4 text-2xl font-light leading-relaxed text-white">
            {questions[currentQuestionIndex]}
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-gray-600"}`}></span>
            <p className="text-sm font-medium text-gray-400">{statusText}</p>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {!isCameraOn ? (
            <button
              onClick={startCamera}
              className="group flex items-center gap-2 rounded-full bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              <FiVideo className="text-blue-400 group-hover:text-blue-300" /> Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="group flex items-center gap-2 rounded-full bg-red-500/10 px-8 py-3 font-semibold text-red-400 backdrop-blur-md transition-all hover:bg-red-500/20 hover:scale-105 active:scale-95"
            >
              <FiVideoOff /> Stop Camera
            </button>
          )}

          <button
            onClick={handleRecordingToggle}
            disabled={isAnalyzing || !isCameraOn}
            className={`flex items-center gap-2 rounded-full px-8 py-3 font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg
              ${
                isAnalyzing
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : isRecording
                  ? "bg-red-600 text-white shadow-red-600/30"
                  : !isCameraOn
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-lime-400 text-black hover:bg-lime-300 shadow-lime-400/30"
              }
            `}
          >
            {isAnalyzing ? (
              "Processing..."
            ) : isRecording ? (
              <><FiStopCircle /> Stop & Submit</>
            ) : (
              <><FiMic /> Submit Answer</>
            )}
          </button>

          {isInterviewComplete && (
            <button
              onClick={handleFinishAndSave}
              className="flex items-center gap-2 rounded-full bg-green-600 px-8 py-3 font-semibold text-white shadow-lg shadow-green-600/30 transition-all hover:bg-green-500 hover:scale-105 active:scale-95"
            >
              Finish & Save
            </button>
          )}
        </motion.div>
      </div>

      {/* --- Feedback Sidebar (Right side) --- */}
      <div className="relative z-10 hidden w-1/4 flex-col border-l border-white/5 bg-black/20 backdrop-blur-2xl md:flex">
        <div className="p-6">
          <h2 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-lime-400"></span>
            Live Analysis
          </h2>
          
          <div className="space-y-4">
            <div className="rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
              <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">Fluency</h3>
              <p className="text-sm text-gray-200 leading-relaxed">{fluency}</p>
            </div>
            
            <div className="rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
              <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">Correctness</h3>
              <p className="text-sm text-gray-200 leading-relaxed">{correctness}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-0">
          <h2 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-widest">Completed</h2>
          <ul className="space-y-3">
            <AnimatePresence>
              {completedQuestions.map((q, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 rounded-lg p-2 text-sm text-gray-400 transition-colors hover:bg-white/5"
                >
                  <FiCheckCircle className="mt-0.5 min-w-[16px] text-lime-500/70" />
                  <span className="line-through decoration-gray-600">{q}</span>
                </motion.li>
              ))}
            </AnimatePresence>
            {completedQuestions.length === 0 && (
              <p className="text-xs text-gray-600 italic">No questions completed yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default InterviewPage;