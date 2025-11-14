import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AddInterview from "../component/AddInterview";

function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Your existing login logic (unchanged)
  const isLoggedIn =
    !!localStorage.getItem("token") || !!localStorage.getItem("user");

  // ✅ Your existing logout function (unchanged)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/"); // redirect to home after logout
  };

  return (
    <>
      
      <div className="relative w-full p-4 z-50">
        <header
          className="
            grid grid-cols-3 items-center  /* 1. The 3-column layout */
            w-full max-w-7xl mx-auto px-6 py-4 /* Sizing and centering */
            bg-black/30 backdrop-blur-lg /* 2. The Glass Effect */
            border border-white/10 /* 3. The Subtle Border */
            rounded-3xl        /* 4. The Rounded Shape */
            text-white         /* 5. Default Text Color */
            shadow-lg"
        >
          {/* Col 1: Logo */}
          <div className="justify-self-start">
            <Link to="/" className="text-2xl font-semibold text-white">
              MockMate
            </Link>
          </div>

          {/* Col 2: Centered Nav Links */}
          <nav className="justify-self-center hidden md:block"> {/* Hides on mobile for a cleaner look */}
            <ul className="flex space-x-8 text-gray-300 font-medium">
              <li>
                <Link
                  to="/"
                  className="hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-white transition-colors duration-200"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Col 3: Buttons & Actions */}
          <div className="justify-self-end flex items-center space-x-6">
            {/* Login/Logout Button */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="font-medium text-red-500 hover:text-red-400 transition-colors duration-200"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/signup"
                className="font-medium text-gray-300 hover:text-white transition-colors duration-200"
              >
                Login/SignUp
              </Link>
            )}

            {/* Start Interview Button (The Lime Green One) */}
            {isLoggedIn && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="
                  bg-lime-300 text-black 
                  px-6 py-2 rounded-full 
                  font-semibold shadow-lg 
                  hover:bg-lime-300 
                  transition-all duration-200 
                  transform hover:scale-105"
              >
                Start Interview
              </button>
            )}
          </div>
        </header>
      </div>

      {/* Your Modal logic (unchanged) */}
      {isModalOpen && <AddInterview onClose={() => setIsModalOpen(false)} />}
    </>
  );
}

export default Navbar;