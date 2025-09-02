import React, { useState } from "react";
import { Link } from "react-router-dom";
import AddInterview from "../component/AddInterview"; // import your modal component

function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            <Link to="/testimonials" className="hover:text-blue-600">
              Testimonials
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-blue-600">
              Contact
            </Link>
          </li>
        </ul>
      </nav>

      {/* Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="ml-6 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
      >
        Start Interview
      </button>

      {/* Add Interview Modal */}
      {isModalOpen && <AddInterview onClose={() => setIsModalOpen(false)} />}
    </header>
  );
}

export default Navbar;
