import React from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import DynamicBackground from './DynamicBackground'

function AuthLayout() {
  return (
    // 1. MAIN WRAPPER: Dark theme & animated background
    <div className="font-sans bg-black text-white min-h-screen overflow-hidden selection:bg-gray-500/30">
      
      {/* 2. DYNAMIC BACKGROUND (Noir Theme) */}
      <div className="absolute inset-0 z-0">
        <DynamicBackground />
        <div className="absolute inset-0 bg-black/40" /> {/* Overlay for better contrast */}
      </div>

      {/* 3. CONTENT WRAPPER */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">

        {/* 4. "GLASS" PANEL to hold the form */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl 
                     border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]
                     rounded-[2rem] w-full max-w-md p-8 md:p-10"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
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