import './App.css'
import { Routes, Route, Outlet } from "react-router-dom";

import LandingPage from './pages/landingPage/LandingPage'
import Signup from './pages/Signup/SignUp'
import Login from './pages/login/Login'
import Navbar from './component/Navbar'

import Dashboard from './pages/dashboard/DashBoard';
import AddInterview from './component/AddInterview';
import InterviewPage from './pages/interview/InterviewPage';
export const serverURL="https://mockmatebackend.vercel.app";
//export const serverURL="http://localhost:3000";



import InterviewSetup from "./pages/InterviewSetup/InterviewSetup"; 
import AuthLayout from './component/AuthLayout';
function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />  
    </>
  )
}

function App() {
  return (
    <Routes>
      {/* Wrap all routes inside Layout */}
      {/* Auth Routes - Wrapped in AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
      </Route>

      {/* Main App Routes - Wrapped in Layout (with Navbar) */}
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="interview" element={<InterviewPage />} />
        <Route path="interview-setup" element={<InterviewSetup />} />
      </Route>
    </Routes>
  )
}

export default App
