import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { serverURL } from "../../App";

const initialDashboardData = {
  metrics: { interviewsTaken: 0, questionsAnswered: 0, scoreAverage: 0, successRate: 0 },
  performanceData: [],
  progressData: [],
  scoreBreakdown: [],
  previousInterviews: [],
};

function Dashboard() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(initialDashboardData);
  const [loading, setLoading] = useState(true);
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
    navigate("/login");
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading Dashboard...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-blue-600 mb-8">AI Interview</h2>
        <ul className="space-y-4 text-gray-700 font-medium">
          <li>Dashboard</li>
          <li>My Interviews</li>
          <li>Practice Questions</li>
          <li>Performance Reports</li>
          <li>Feedback</li>
          <li>Resume Analyzer</li>
          <li>Settings</li>
        </ul>
        <div className="mt-auto">
          <p className="font-bold">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name}!</h1>
          <p className="text-gray-500">Here is your performance summary.</p>
        </header>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500">Interviews Taken</h3>
            <p className="text-2xl font-bold">{dashboardData.metrics.interviewsTaken}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500">Questions Answered</h3>
            <p className="text-2xl font-bold">{dashboardData.metrics.questionsAnswered}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500">Avg. Overall Score</h3>
            <p className="text-2xl font-bold">{dashboardData.metrics.scoreAverage}%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500">Success Rate</h3>
            <p className="text-2xl font-bold">{dashboardData.metrics.successRate}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Performance by Job Role</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="domain" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Average Score Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dashboardData.scoreBreakdown}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Over Time */}
        <div className="bg-white mt-6 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Score Progress Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="avgScore" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Previous Interviews */}
        <div className="bg-white mt-6 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Previous Interviews</h3>
          {dashboardData.previousInterviews.length === 0 ? (
            <p className="text-gray-500">No previous interviews found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">Date</th>
                    <th className="p-2">Job Role</th>
                    <th className="p-2">Difficulty</th>
                    <th className="p-2">Overall Score</th>
                    <th className="p-2">Fluency</th>
                    <th className="p-2">Confidence</th>
                    <th className="p-2">Correctness</th>
                    <th className="p-2">Body Language</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.previousInterviews.map((interview) => (
                    <tr key={interview.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-2">{interview.jobRole}</td>
                      <td className="p-2 capitalize">{interview.difficulty}</td>
                      <td className="p-2 font-semibold">{interview.overallScore}%</td>
                      <td className="p-2">{interview.fluency}</td>
                      <td className="p-2">{interview.confidence}</td>
                      <td className="p-2">{interview.correctness}</td>
                      <td className="p-2">{interview.bodyLanguage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
