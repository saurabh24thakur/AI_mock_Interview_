// FILE: frontend/src/pages/InterviewPage.jsx
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../../App";

function InterviewPage() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [fluency, setFluency] = useState("Waiting for your response...");
  const [correctness, setCorrectness] = useState("Waiting for your response...");

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusText, setStatusText] = useState(
    "Click 'Submit Answer' to start recording."
  );

  const navigate = useNavigate();

  // --- FETCH QUESTIONS FROM BACKEND ---
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo ? userInfo.token : null;

        if (!token) {
          alert("You are not logged in. Please log in first.");
          navigate("/login");
          return;
        }

        const { data } = await axios.post(
          `${serverURL}/api/interviews/generate-questions`,
          { jobRole: "Frontend Developer", difficulty: "medium" },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          alert("No questions generated. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        alert("Failed to fetch questions.");
      }
    };

    fetchQuestions();
  }, [navigate]);

  // --- CAMERA + RECORDING FUNCTIONS ---
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
      console.error("Error accessing camera:", err);
      alert("Error: Could not access camera/microphone.");
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
      setStatusText("Recording... Click again to stop and submit.");
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
        alert("Not logged in.");
        navigate("/login");
        return;
      }

      // ✅ no manual Content-Type header (Axios will set correct boundary)
      const { data } = await axios.post(
        `${serverURL}/api/interviews/analyze`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFluency(data.analysis.fluency || "Analysis complete.");
      setCorrectness(data.analysis.correctness || "Analysis complete.");
      setCompletedQuestions((prev) => [...prev, questions[currentQuestionIndex]]);

      setCurrentQuestionIndex((prevIndex) => {
        if (prevIndex < questions.length - 1) {
          setStatusText("Click 'Submit Answer' to start recording next question.");
          return prevIndex + 1;
        } else {
          setStatusText("Interview complete! 🎉");
          alert("All questions answered!");
          return prevIndex;
        }
      });
    } catch (err) {
      console.error("Analysis API error:", err);
      setFluency("Error during analysis.");
      setCorrectness("Error during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- LOADING STATE ---
  if (questions.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1 className="text-2xl font-semibold text-gray-700">
          Loading Interview Questions...
        </h1>
      </div>
    );
  }

  // --- JSX ---
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      {/* Left side: camera + interviewer */}
      <div className="w-full md:w-2/3 flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          Mock Interview Session
        </h1>

        {/* video & interviewer */}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="relative bg-white shadow-xl rounded-2xl p-4 w-72 h-72">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full rounded-xl object-cover border-2 border-blue-500"
            ></video>
            <span className="absolute bottom-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
              You
            </span>
          </div>
          <div className="relative bg-white shadow-xl rounded-2xl p-4 w-72 h-72 flex flex-col items-center justify-center">
            <img
              src="https://i.ibb.co/6mZ3Q9m/ai-avatar.png"
              alt="AI Interviewer"
              className="w-32 h-32 rounded-full object-cover"
            />
            <p className="mt-3 font-semibold text-gray-700">AI Interviewer</p>
          </div>
        </div>

        {/* current question */}
        <div className="mt-8 bg-white shadow-md rounded-xl px-6 py-4 w-full max-w-2xl text-center">
          <h2 className="text-lg font-semibold text-gray-800">Current Question</h2>
          <p className="text-blue-700 mt-2 text-xl font-medium">
            {questions[currentQuestionIndex]}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <p className="mt-2 text-sm text-gray-600">{statusText}</p>
        </div>

        {/* controls */}
        <div className="flex space-x-4 mt-6">
          {!isCameraOn ? (
            <button onClick={startCamera} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
              Start Camera
            </button>
          ) : (
            <button onClick={stopCamera} className="px-6 py-2 bg-red-600 text-white rounded-lg">
              Stop Camera
            </button>
          )}
          <button
            onClick={handleRecordingToggle}
            disabled={isAnalyzing || !isCameraOn}
            className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400"
          >
            {isAnalyzing
              ? "Analyzing..."
              : isRecording
              ? "Stop & Submit"
              : "Submit Answer"}
          </button>
        </div>
      </div>

      {/* Right side: feedback */}
      <div className="w-full md:w-1/3 p-8 bg-white overflow-y-auto">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Live Observations</h2>
        <div className="bg-blue-50 p-4 rounded-lg shadow mb-4">
          <h3 className="font-medium text-gray-800">Fluency</h3>
          <p className="text-gray-600">{fluency}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow mb-6">
          <h3 className="font-medium text-gray-800">Correctness</h3>
          <p className="text-gray-600">{correctness}</p>
        </div>

        <h2 className="text-lg font-semibold text-blue-700 mb-2">Completed Questions</h2>
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
