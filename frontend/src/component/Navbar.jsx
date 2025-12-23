import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AddInterview from "../component/AddInterview";
import procoderLogo from "../assets/procoderLogo.png";

function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn =
    !!localStorage.getItem("token") || !!localStorage.getItem("user") || !!localStorage.getItem("userInfo");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <>
      {/* Main Header Container - Grid Layout for Alignment */}
      <div className="fixed top-0 left-0 w-full z-50 p-6 grid grid-cols-[auto_1fr_auto] items-center pointer-events-none">
        
        {/* Left: Logo */}
        <div className="pointer-events-auto">
          <Link to="/" className="block">
            <img 
              src={procoderLogo} 
              alt="MockMate Logo" 
              className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform duration-300 rounded-full" 
            />
          </Link>
        </div>

        {/* Center: Navbar Pill */}
        <div className="pointer-events-auto justify-self-center w-[95%] md:w-[60%]">
          <header
            className="
              flex items-center justify-between
              w-full px-3 py-2
              bg-black/60 backdrop-blur-2xl
              border border-white/10
              rounded-full
              shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            {/* Left: Brand Text */}
            <Link to="/" className="flex items-center gap-2 pl-4">
              <span className="text-lg font-bold text-white tracking-tight">
                Mock<span className="text-gray-400">Mate</span>
              </span>
            </Link>

            {/* Center: Nav Links */}
            <nav className="hidden md:block">
              <ul className="flex items-center gap-1 bg-white/5 rounded-full px-2 py-1 border border-white/5">
                <li>
                  <Link
                    to="/"
                    className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Right: Actions (Login/Logout only) */}
            <div className="flex items-center gap-2 pr-1">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Login
                </Link>
              )}
            </div>
          </header>
        </div>

        {/* Right: Start Button */}
        <div className="pointer-events-auto">
          {isLoggedIn && location.pathname !== "/interview" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="
                bg-white text-black 
                px-6 py-3 rounded-full 
                text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]
                hover:bg-gray-200 
                transition-all duration-200 
                transform hover:scale-105"
            >
              Start Interview
            </button>
          )}
        </div>

      </div>

      {isModalOpen && <AddInterview onClose={() => setIsModalOpen(false)} />}
    </>
  );
}

export default Navbar;