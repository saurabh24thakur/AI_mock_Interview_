import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { serverURL } from "../../App";
import { motion } from "framer-motion"; // 1. Import Framer Motion
import { // 2. Import icons
  FiGrid, FiBarChart2, FiPieChart, FiSettings, FiLogOut, FiList, FiCpu, FiAward 
} from "react-icons/fi";

// Initial data (unchanged)
const initialDashboardData = {
  metrics: { interviewsTaken: 0, questionsAnswered: 0, scoreAverage: 0, successRate: 0 },
  performanceData: [],
  progressData: [],
  scoreBreakdown: [],
  previousInterviews: [],
};

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 100 }
  }
};

// --- Custom Tooltip for Dark Mode Charts ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-white font-semibold">{label}</p>
        <p className="text-lime-400">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};


function Dashboard() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(initialDashboardData);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null); // To track the selected interview
  const navigate = useNavigate();

  // Data fetching logic (unchanged)
  useEffect(() => {
    const fetchData = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo || !userInfo.token) {
        navigate("/login");
        return;
      }
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      try {
        const [profileRes, dashboardRes] = await Promise.all([
          axios.get(`${serverURL}/api/users/profile`, config),
          axios.get(`${serverURL}/api/dashboard`, config),
        ]);
        setUser(profileRes.data);
        setDashboardData(dashboardRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        localStorage.removeItem("userInfo");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  // --- Handlers for interview details ---
  const handleInterviewClick = (interview) => {
    setSelectedInterview(interview);
  };

  const handleCloseDetails = () => {
    setSelectedInterview(null);
  };

  if (loading) {
    return (
      // 3. Redesigned Loading State
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        Loading Dashboard...
      </div>
    );
  }

  return (
    // 4. MAIN LAYOUT: Switched to dark theme
    <div className="flex min-h-screen bg-black text-gray-300">
      
      {/* 5. SIDEBAR: Redesigned as a "glass" panel */}
      <aside className="w-64 bg-gray-900/70 backdrop-blur-lg border-r border-white/10 p-6 flex-col hidden md:flex">
        <h2 className="text-3xl font-bold text-lime-400 mb-10">
          MockMate
        </h2>
        <ul className="space-y-4 font-medium flex-1">
          {/* Sidebar links with icons */}
          <li className="flex items-center gap-3 p-3 rounded-lg text-lime-400 bg-lime-400/10 font-semibold">
            <FiGrid /> Dashboard
          </li>
          <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <FiList /> My Interviews
          </li>
          <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <FiCpu /> Practice Questions
          </li>
          <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <FiAward /> Performance
          </li>
        </ul>
        <div className="mt-auto">
          <p className="font-bold text-white">{user?.name}</p>
          <p className="text-sm text-gray-400 mb-4">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/80 text-white py-2 rounded-lg font-semibold 
                       hover:bg-red-500 transition flex items-center justify-center gap-2"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* 6. MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white">
            Welcome back, <span className="text-lime-400">{user?.name}!</span>
          </h1>
          <p className="text-gray-400">Here is your performance summary.</p>
        </header>

        {/* 7. METRICS: Redesigned as "glass" cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="bg-gray-900/70 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg">
            <h3 className="text-gray-400">Interviews Taken</h3>
            <p className="text-3xl font-bold text-white">{dashboardData.metrics.interviewsTaken}</p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-gray-900/70 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg">
            <h3 className="text-gray-400">Questions Answered</h3>
            <p className="text-3xl font-bold text-white">{dashboardData.metrics.questionsAnswered}</p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-gray-900/70 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg">
            <h3 className="text-gray-400">Avg. Overall Score</h3>
            <p className="text-3xl font-bold text-lime-400">{dashboardData.metrics.scoreAverage}%</p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-gray-900/70 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg">
            <h3 className="text-gray-400">Success Rate</h3>
            <p className="text-3xl font-bold text-lime-400">{dashboardData.metrics.successRate}%</p>
          </motion.div>
        </motion.div>

        {/* 8. CHARTS: Redesigned for dark mode */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-gray-900/70 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Performance by Job Role</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.performanceData}>
                <CartesianGrid stroke="#4b5563" strokeDasharray="3 3" />
                <XAxis dataKey="domain" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" fill="#a3e635" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gray-900/70 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Average Score Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dashboardData.scoreBreakdown}>
                <PolarGrid stroke="#4b5563" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="none" />
                <Radar name="Score" dataKey="score" stroke="#a3e635" fill="#a3e635" fillOpacity={0.4} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>

        {/* Progress Over Time */}
        <motion.div 
          className="bg-gray-900/70 backdrop-blur-lg border border-white/10 mt-6 p-6 rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Score Progress Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.progressData}>
              <CartesianGrid stroke="#4b5563" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis domain={[0, 100]} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="avgScore" stroke="#a3e635" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 9. TABLE: Redesigned for dark mode */}
        <motion.div 
          className="bg-gray-900/70 backdrop-blur-lg border border-white/10 mt-6 p-6 rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Previous Interviews</h3>
          {dashboardData.previousInterviews.length === 0 ? (
            <p className="text-gray-400">No previous interviews found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="p-3 text-gray-300">Date</th>
                    <th className="p-3 text-gray-300">Job Role</th>
                    <th className="p-3 text-gray-300">Difficulty</th>
                    <th className="p-3 text-gray-300">Overall Score</th>
                    <th className="p-3 text-gray-300">Fluency</th>
                    <th className="p-3 text-gray-300">Confidence</th>
                    <th className="p-3 text-gray-300">Correctness</th>
                    <th className="p-3 text-gray-300">Body Language</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.previousInterviews.map((interview) => (
                    <tr 
                      key={interview.id} 
                      className="border-b border-gray-700 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleInterviewClick(interview)}
                    >
                      <td className="p-3 text-gray-400">{new Date(interview.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 text-gray-400">{interview.jobRole}</td>
                      <td className="p-3 text-gray-400 capitalize">{interview.difficulty}</td>
                      <td className="p-3 font-semibold text-lime-400">{interview.overallScore}%</td>
                      <td className="p-3 text-gray-400">{interview.fluency}</td>
                      <td className="p-3 text-gray-400">{interview.confidence}</td>
                      <td className="p-3 text-gray-400">{interview.correctness}</td>
                      <td className="p-3 text-gray-400">{interview.bodyLanguage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* 10. INTERVIEW DETAILS MODAL */}
        {selectedInterview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={handleCloseDetails}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="bg-gray-900 border border-lime-400/30 rounded-2xl shadow-2xl w-full max-w-3xl p-8"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-lime-400">{selectedInterview.jobRole} Interview</h2>
                  <p className="text-gray-400">{new Date(selectedInterview.createdAt).toLocaleString()}</p>
                </div>
                <button 
                  onClick={handleCloseDetails} 
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scores */}
                <div className="bg-gray-800/50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-4">Performance Scores</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Overall Score</span>
                      <span className="font-bold text-2xl text-lime-400">{selectedInterview.overallScore}%</span>
                    </div>
                    <hr className="border-gray-700"/>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Fluency</span>
                      <span className="font-semibold text-white">{selectedInterview.fluency}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Confidence</span>
                      <span className="font-semibold text-white">{selectedInterview.confidence}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Correctness</span>
                      <span className="font-semibold text-white">{selectedInterview.correctness}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Body Language</span>
                      <span className="font-semibold text-white">{selectedInterview.bodyLanguage}</span>
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                <div className="bg-gray-800/50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-4">Valuable Feedback</h3>
                  <div className="text-gray-300 space-y-4">
                    {selectedInterview.feedback ? (
                      <p>{selectedInterview.feedback}</p>
                    ) : (
                      <p>No specific feedback was provided for this interview.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;