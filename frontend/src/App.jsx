import './App.css'
import { Routes, Route } from "react-router-dom";
import LandingPage from './pages/landingPage/LandingPage'
import Signup from './pages/Signup/SignUp'
import Login from './pages/login/Login'
import Navbar from './component/Navbar'
import { Outlet } from "react-router-dom";
import Dashboard from './pages/dashboard/DashBoard';
import AddInterview from './component/AddInterview';
import InterviewPage from './pages/interview/InterviewPAge';
export const serverURL="http://localhost:3000";

import InterviewSetup from "./pages/InterviewSetup/InterviewSetup"; 
function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />  {/* Page content will render here */}
    </>
  )
}

function App() {
  return (
    <Routes>
      {/* Wrap all routes inside Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="interview" element={<InterviewPage />} />
        <Route path="/interview-setup" element={<InterviewSetup />} />
      </Route>
    </Routes>
  )
}

export default App
