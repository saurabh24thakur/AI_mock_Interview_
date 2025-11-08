import React from 'react'
import { Outlet } from 'react-router-dom' // 1. Import Outlet
import { motion } from 'framer-motion'   // 2. Import motion

function AuthLayout() {
  return (
    // 1. MAIN WRAPPER: Dark theme & animated background
    <div className="font-sans bg-black text-white min-h-screen overflow-hidden">
      
      {/* 2. ANIMATED BACKGROUND (Same as LandingPage) */}
      <div className="absolute top-0 left-0 w-full h-full z-0 opacity-50">
        <div className="animated-aurora"></div>
        <style jsx>{`
          .animated-aurora {
            width: 100%;
            height: 100%;
            position: fixed;
            background: linear-gradient(
              -45deg,
              #111214 30%,
              #3b0764,
              #111214 70%
            );
            background-size: 400% 400%;
            animation: gradientFlow 15s ease infinite;
          }

          @keyframes gradientFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>

      {/* 3. CONTENT WRAPPER
        This 'relative' wrapper ensures content stays on top
      */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">

        {/* 4. "GLASS" PANEL to hold the form */}
        <motion.div
          className="bg-gray-900/70 backdrop-blur-lg 
                     border border-white/10 shadow-xl
                     rounded-3xl w-full max-w-md p-8 md:p-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* 5. This Outlet renders your Login/Signup component */}
          <Outlet />

        </motion.div>

      </div>
    </div>
  )
}

export default AuthLayout