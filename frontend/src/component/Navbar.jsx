import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AddInterview from "../component/AddInterview";

function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ check login status (token OR user in localStorage)
  const isLoggedIn =
    !!localStorage.getItem("token") || !!localStorage.getItem("user");

  // ✅ logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/"); // redirect to home after logout
  };

  // ✅ show "Start Interview" only on home or dashboard
  const showStartInterview =
    location.pathname === "/" || location.pathname === "/dashboard";

  return (
    <header className="flex justify-between items-center px-10 py-5 shadow-sm bg-white">
      {/* Logo */}
      <div className="text-2xl font-semibold text-blue-600">MockMate</div>

      {/* Nav Links */}
      <nav>
        <ul className="flex space-x-6 text-gray-700 font-medium">
          <li>
            <Link to="/" className="hover:text-blue-600">
              Home
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-blue-600">
              Contact
            </Link>
          </li>
          <li>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="hover:text-red-600 text-red-700"
              >
                Logout
              </button>
            ) : (
              <Link to="/signup" className="hover:text-blue-600 text-blue-700">
                Login/SignUp
              </Link>
            )}
          </li>
        </ul>
      </nav>

      {/* Button: Start Interview (only visible if logged in + home/dashboard) */}
      {isLoggedIn && showStartInterview && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-6 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Start Interview
        </button>
      )}

      {/* Add Interview Modal */}
      {isModalOpen && <AddInterview onClose={() => setIsModalOpen(false)} />}
    </header>
  );
}

export default Navbar;
