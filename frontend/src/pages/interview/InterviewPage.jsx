import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../../App";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiVideo, FiVideoOff, FiMic, FiStopCircle, FiCheckCircle, FiCpu, FiUser
} from "react-icons/fi";
import DynamicBackground from "../../component/DynamicBackground";


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
  const isRecordingRef = useRef(false); // Ref to track state in event listeners
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusText, setStatusText] = useState(
    "Click 'Start Answer' to start recording."
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

  // Helper to update both state and ref
  const updateIsRecording = (val) => {
    setIsRecording(val);
    isRecordingRef.current = val;
  };

  // --- Web Speech API Setup ---
  const recognitionRef = useRef(null);
  const transcriptRef = useRef(""); // Stores finalized text
  const interimTranscriptRef = useRef(""); // Stores current interim text
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false); // For UI animation

  const setupRecognition = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false; 
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
          console.log("🎤 Speech Recognition Started");
      };

      recognition.onsoundstart = () => {
          console.log("🔊 Sound Detected");
          setIsSpeaking(true);
      };

      recognition.onsoundend = () => {
          console.log("🔇 Sound Ended");
          setIsSpeaking(false);
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscriptChunk = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptChunk += event.results[i][0].transcript + " ";
            console.log("✅ Final Transcript Chunk:", event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
            console.log("📝 Interim Transcript:", event.results[i][0].transcript);
          }
        }

        if (finalTranscriptChunk) {
            transcriptRef.current += finalTranscriptChunk;
        }
        
        interimTranscriptRef.current = interimTranscript; 
        setTranscript(transcriptRef.current + interimTranscript); 
        
        setIsSpeaking(true);
        clearTimeout(recognition.speakingTimeout);
        recognition.speakingTimeout = setTimeout(() => setIsSpeaking(false), 1000);
      };

      recognition.onerror = (event) => {
        console.error("❌ Speech Recognition Error:", event.error);
        if (event.error === 'no-speech') {
           return; 
        }
        if (event.error === 'not-allowed') {
           alert("Microphone access denied. Please allow microphone access.");
           updateIsRecording(false);
        }
      };
      
      recognition.onend = () => {
          console.log("🛑 Speech Recognition Ended");
          setIsSpeaking(false); 
          if (isRecordingRef.current) {
             console.log("🔄 Restarting Speech Recognition...");
             try {
                recognition.start();
             } catch (e) {
                console.error("Failed to restart:", e);
             }
          }
      };
      
      recognitionRef.current = recognition;
    }
  };

  useEffect(() => {
    setupRecognition();
  }, []);


  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);

  const setupAudioVisualizer = async (stream) => {
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) {
        console.warn("No audio tracks found in stream for visualizer.");
        return;
    }
    
    console.log("Audio Track Status:", { 
        label: audioTrack.label, 
        enabled: audioTrack.enabled, 
        muted: audioTrack.muted, 
        readyState: audioTrack.readyState 
    });

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    if (audioContext.state === 'suspended') {
        try {
            await audioContext.resume();
            console.log("AudioContext resumed. State:", audioContext.state);
        } catch (e) {
            console.error("Failed to resume AudioContext:", e);
        }
    }

    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    source.connect(analyser);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    const updateVolume = () => {
      if (!analyserRef.current) return;
      
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      
      // Debug log every ~60 frames (approx 1 sec)
      if (Math.random() < 0.05) {
         console.log("Raw Audio Average:", average);
      }

      // Scale to 0-100 roughly
      const level = Math.min(100, Math.max(0, average * 5)); // Increased sensitivity to 5x
      
      setAudioLevel(level);
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    };

    updateVolume();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true, // Request audio for the visualizer
      });
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true; // Prevent feedback loop
      setIsCameraOn(true);
      
      setupAudioVisualizer(stream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError') {
          alert("Permission denied. Please allow camera and microphone access in your browser settings.");
      } else if (err.name === 'NotFoundError') {
          alert("No camera or microphone found. Please connect a device.");
      } else if (err.name === 'NotReadableError') {
          alert("Camera/Microphone is in use by another application. Please close Zoom, Teams, or other apps.");
      } else {
          alert(`Could not access device: ${err.message}`);
      }
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    
    if (audioContextRef.current) {
        audioContextRef.current.close();
        cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsCameraOn(false);
    updateIsRecording(false);
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const handleRecordingToggle = async () => {
    if (!isCameraOn) {
      alert("Please start your camera first.");
      return;
    }
    
    if (!recognitionRef.current) {
        setupRecognition(); 
        if (!recognitionRef.current) {
            alert("Speech recognition not supported.");
            return;
        }
    }

    if (isRecording) {
      recognitionRef.current.stop();
      updateIsRecording(false);
      submitAnswer(); 
    } else {
      // Mic check removed as it's already handled by startCamera
      if (!isCameraOn) {
         alert("Please start camera/mic first.");
         return;
      }

      setTranscript(""); 
      transcriptRef.current = ""; // Clear ref
      try {
        recognitionRef.current.start();
        updateIsRecording(true);
        setStatusText("Listening... Speak clearly.");
      } catch (err) {
        console.error("Failed to start recognition:", err);
        alert("Failed to start speech recognition. Please refresh and try again.");
      }
    }
  };

  const submitAnswer = async () => {
    setIsAnalyzing(true);
    setStatusText("Analyzing your response...");
    setFluency("Analyzing...");
    setCorrectness("Analyzing...");

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo ? userInfo.token : null;
      if (!token) {
        navigate("/login");
        return;
      }

      // Wait a brief moment to ensure final transcript is captured
      await new Promise(resolve => setTimeout(resolve, 1000));

      const finalAnswer = (transcriptRef.current + interimTranscriptRef.current).trim() || "No answer provided.";
      console.log("Submitting Answer:", finalAnswer); // Debug log

      const { data } = await axios.post(
        `${serverURL}/api/interviews/analyze`,
        {
            question: questions[currentQuestionIndex],
            answer: finalAnswer
        },
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
          setStatusText("Click 'Start Answer' for next question.");
          return prevIndex + 1;
        } else {
          setStatusText("Interview complete! 🎉 Click 'Finish & Save' to view your report.");
          setIsInterviewComplete(true);
          return prevIndex;
        }
      });
    } catch (err) {
      console.error(err);
      setFluency("Error during analysis.");
      setCorrectness("Error during analysis.");
    } finally {
      setIsAnalyzing(false);
      updateIsRecording(false);
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
          difficulty: "Medium",
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
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          <h1 className="text-xl font-light tracking-wider text-gray-300">Initializing Interview Environment...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-black text-white font-sans selection:bg-gray-500/30">
      {/* Browser Compatibility Warning */}
      {!("webkitSpeechRecognition" in window || "SpeechRecognition" in window) && (
        <div className="absolute top-0 left-0 w-full bg-yellow-600/90 text-white p-2 text-center z-50 backdrop-blur-md font-medium">
           ⚠️ Your browser does not support Speech Recognition. Please use <b>Google Chrome</b> or <b>Microsoft Edge</b>.
        </div>
      )}
      <DynamicBackground />

      {/* --- Main Content (Left side) --- */}
      <div className="relative z-10 flex w-full flex-col items-center justify-start p-4 pt-28 md:w-3/4 md:p-8 md:pt-32 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
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
          className="flex flex-col items-center justify-center w-full max-w-5xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* User Video Card - Enlarged */}
          <div className="group relative flex h-[50vh] w-full max-w-4xl flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl transition-all hover:border-white/20">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
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
            
            {/* Audio Visualizer Overlay */}
            {isCameraOn && (
               <div className="absolute bottom-4 right-4 flex items-end gap-1 h-8 bg-black/40 p-2 rounded-lg backdrop-blur-sm border border-white/5">
                  <div className="text-[10px] text-white/70 mr-1 font-mono self-center tracking-wider">MIC</div>
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className={`w-1 rounded-full transition-all duration-75 ${
                         audioLevel > (i * 20) ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-white/10"
                      }`}
                      style={{ height: audioLevel > (i * 20) ? `${Math.max(20, audioLevel * 0.8)}%` : "20%" }}
                    />
                  ))}
               </div>
            )}
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div
          className="mt-4 w-full max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl shadow-2xl"
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
          className="mt-6 flex flex-wrap justify-center gap-4"
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
                  : "bg-white text-black hover:bg-gray-200 shadow-white/30"
              }
            `}
          >
            {isAnalyzing ? (
              "Processing..."
            ) : isRecording ? (
              <>
                <FiStopCircle /> Stop & Submit
                {isSpeaking && (
                  <div className="flex gap-1 ml-2">
                    <motion.div
                      className="w-1.5 h-1.5 bg-white rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-1.5 h-1.5 bg-white rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-1.5 h-1.5 bg-white rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                )}
              </>
            ) : (
              <><FiMic /> Start Answer</>
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
        <div className="p-6 mt-20">
          <h2 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white"></span>
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
                  <FiCheckCircle className="mt-0.5 min-w-[16px] text-white/70" />
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