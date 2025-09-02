import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { serverURL } from "../../App"; // ADDED: Import serverURL from App.jsx

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // --- ALTERED SECTION TO MATCH SIGNUP.JSX ---
      const res = await axios.post(
        `${serverURL}/api/users/login`, // Using serverURL from App.jsx
        formData                      // Sending the entire formData object directly
      );
      // --- END OF ALTERED SECTION ---

      alert("✅ Login successful!");
      console.log(res.data);

      // store token or user data in localStorage
      localStorage.setItem("userInfo", JSON.stringify(res.data));

      // redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      // Made error message more robust, like in Signup.jsx
      alert("❌ Login failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-blue-600 mb-6">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Blue Section */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-blue-600">
        <h1 className="text-4xl font-bold text-white text-center px-10">
          Welcome to <span className="text-white">Imagine</span> 🌟
        </h1>
      </div>
    </div>
  );
}