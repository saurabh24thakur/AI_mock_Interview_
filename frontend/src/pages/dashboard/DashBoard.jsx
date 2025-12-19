import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { serverURL } from "../../App";
import { motion } from "framer-motion";
import {
  FiGrid, FiBarChart2, FiPieChart, FiSettings, FiLogOut, FiList, FiCpu, FiAward 
} from "react-icons/fi";
import PracticeQuestions from "../../component/PracticeQuestions";
import DynamicBackground from "../../component/DynamicBackground";

// Initial data
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
      <div className="bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-xl">
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
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const navigate = useNavigate();

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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleInterviewClick = (interview) => {
    setSelectedInterview(interview);
  };

  const handleCloseDetails = () => {
    setSelectedInterview(null);
  };

  if (loading) {
    return (
      <div className="relative flex justify-center items-center min-h-screen bg-black text-white overflow-hidden">
        <DynamicBackground />
        <div className="z-10 flex flex-col items-center gap-4">
           <div className="h-12 w-12 animate-spin rounded-full border-4 border-lime-400 border-t-transparent"></div>
           <p className="text-gray-300 font-light tracking-wider">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const getLinkClass = (viewName) => {
    const baseClass = "flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer font-medium";
    const activeClass = "text-black bg-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.4)]";
    const inactiveClass = "hover:bg-white/10 text-gray-400 hover:text-white";
    return `${baseClass} ${activeView === viewName ? activeClass : inactiveClass}`;
  };

  return (
    <div className="relative flex min-h-screen bg-black text-gray-300 overflow-hidden font-sans selection:bg-lime-500/30">
      <DynamicBackground />
      
      {/* SIDEBAR */}
      <aside className="relative z-10 w-72 bg-black/20 backdrop-blur-2xl border-r border-white/5 p-8 flex-col hidden md:flex">
        <div className="mb-10 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-lime-400 flex items-center justify-center">
            <FiCpu className="text-black text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            MockMate
          </h2>
        </div>

        <ul className="space-y-2 font-medium flex-1">
          <li className={getLinkClass("dashboard")} onClick={() => setActiveView("dashboard")}>
            <FiGrid /> Dashboard
          </li>
          <li className={getLinkClass("my-interviews")} onClick={() => setActiveView("my-interviews")}>
            <FiList /> My Interviews
          </li>
          <li className={getLinkClass("practice")} onClick={() => setActiveView("practice")}>
            <FiCpu /> Practice Questions
          </li>
          <li className={getLinkClass("performance")} onClick={() => setActiveView("performance")}>
            <FiAward /> Performance
          </li>
        </ul>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-lime-400 to-green-600 flex items-center justify-center text-black font-bold text-lg">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate w-32">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-white/5 text-gray-300 py-2.5 rounded-lg font-medium 
                       hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-red-500/30"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 p-8 overflow-y-auto h-screen scrollbar-hide">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-400">{user?.name}!</span>
            </h1>
            <p className="text-gray-500 mt-2">Here's your interview performance summary.</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </header>

        {/* DASHBOARD VIEW */}
        {activeView === "dashboard" && (
          <>
            {/* METRICS */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { title: "Interviews Taken", value: dashboardData.metrics.interviewsTaken, color: "text-white" },
                { title: "Questions Answered", value: dashboardData.metrics.questionsAnswered, color: "text-white" },
                { title: "Avg. Score", value: `${dashboardData.metrics.scoreAverage}%`, color: "text-lime-400" },
                { title: "Success Rate", value: `${dashboardData.metrics.successRate}%`, color: "text-lime-400" },
              ].map((item, index) => (
                <motion.div key={index} variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-lg hover:bg-white/10 transition-colors">
                  <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{item.title}</h3>
                  <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* CHARTS */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-6">Performance by Job Role</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.performanceData}>
                    <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="domain" stroke="#6b7280" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#6b7280" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="score" fill="#a3e635" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-6">Score Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dashboardData.scoreBreakdown}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="subject" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="none" />
                    <Radar name="Score" dataKey="score" stroke="#a3e635" strokeWidth={2} fill="#a3e635" fillOpacity={0.3} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>
            </motion.div>

            {/* Progress Over Time */}
            <motion.div 
              className="bg-white/5 backdrop-blur-xl border border-white/10 mt-6 p-6 rounded-2xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-white mb-6">Score Progress</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.progressData}>
                  <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#6b7280" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="avgScore" stroke="#a3e635" strokeWidth={3} dot={{r: 4, fill: '#a3e635'}} activeDot={{r: 6, strokeWidth: 0}} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* TABLE */}
            <motion.div 
              className="bg-white/5 backdrop-blur-xl border border-white/10 mt-6 p-6 rounded-2xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-white mb-6">Recent Interviews</h3>
              {dashboardData.previousInterviews.length === 0 ? (
                <p className="text-gray-500 italic">No previous interviews found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 font-medium">Job Role</th>
                        <th className="p-4 font-medium">Difficulty</th>
                        <th className="p-4 font-medium">Score</th>
                        <th className="p-4 font-medium">Fluency</th>
                        <th className="p-4 font-medium">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-300">
                      {dashboardData.previousInterviews.slice(0, 5).map((interview) => (
                        <tr 
                          key={interview.id} 
                          className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                          onClick={() => handleInterviewClick(interview)}
                        >
                          <td className="p-4">{new Date(interview.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 font-medium text-white">{interview.jobRole}</td>
                          <td className="p-4 capitalize">
                            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
                              {interview.difficulty}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-lime-400">{interview.overallScore}%</td>
                          <td className="p-4">{interview.fluency}</td>
                          <td className="p-4">{interview.confidence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* MY INTERVIEWS VIEW */}
        {activeView === "my-interviews" && (
          <motion.div 
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-2xl font-semibold text-white mb-6">My Interviews History</h3>
            {dashboardData.previousInterviews.length === 0 ? (
              <p className="text-gray-500">No previous interviews found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Job Role</th>
                      <th className="p-4 font-medium">Difficulty</th>
                      <th className="p-4 font-medium">Score</th>
                      <th className="p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-300">
                    {dashboardData.previousInterviews.map((interview) => (
                      <tr 
                        key={interview.id} 
                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => handleInterviewClick(interview)}
                      >
                        <td className="p-4">{new Date(interview.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 font-medium text-white">{interview.jobRole}</td>
                        <td className="p-4 capitalize">{interview.difficulty}</td>
                        <td className="p-4 font-bold text-lime-400">{interview.overallScore}%</td>
                        <td className="p-4">
                          <span className="text-green-400 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span> Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* PRACTICE QUESTIONS VIEW */}
        {activeView === "practice" && (
          <PracticeQuestions />
        )}

        {/* PERFORMANCE VIEW */}
        {activeView === "performance" && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-2xl font-semibold text-white">Performance Analysis</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-6">Performance by Job Role</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.performanceData}>
                    <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="domain" stroke="#6b7280" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#6b7280" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="score" fill="#a3e635" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-6">Average Score Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dashboardData.scoreBreakdown}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="subject" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="none" />
                    <Radar name="Score" dataKey="score" stroke="#a3e635" strokeWidth={2} fill="#a3e635" fillOpacity={0.3} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-6">Score Progress Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.progressData}>
                  <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#6b7280" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="avgScore" stroke="#a3e635" strokeWidth={3} dot={{r: 4, fill: '#a3e635'}} activeDot={{r: 6, strokeWidth: 0}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}


        {/* INTERVIEW DETAILS MODAL */}
        {selectedInterview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={handleCloseDetails}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="bg-[#111] border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl p-8 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-400 to-green-600"></div>
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{selectedInterview.jobRole} Interview</h2>
                  <p className="text-gray-400 text-sm">{new Date(selectedInterview.createdAt).toLocaleString()}</p>
                </div>
                <button 
                  onClick={handleCloseDetails} 
                  className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 hover:text-white transition-colors"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scores */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FiAward className="text-lime-400" /> Performance Scores
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <span className="text-gray-300">Overall Score</span>
                      <span className="font-bold text-2xl text-lime-400">{selectedInterview.overallScore}%</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Fluency</span>
                        <span className="font-medium text-white">{selectedInterview.fluency}</span>
                      </div>
                      <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-lime-400 h-full rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                     <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Confidence</span>
                        <span className="font-medium text-white">{selectedInterview.confidence}</span>
                      </div>
                      <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-lime-400 h-full rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FiList className="text-lime-400" /> Feedback
                  </h3>
                  <div className="text-gray-300 text-sm leading-relaxed h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600">
                    {selectedInterview.feedback ? (
                      <p>{selectedInterview.feedback}</p>
                    ) : (
                      <p className="italic text-gray-500">No specific feedback was provided for this interview.</p>
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