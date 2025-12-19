import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AddInterview from '../../component/AddInterview';
import { useNavigate } from 'react-router-dom';
import DynamicBackground from '../../component/DynamicBackground';
import { FiArrowRight, FiArrowDown, FiCpu, FiBarChart2, FiFileText, FiCheck, FiActivity } from 'react-icons/fi';

// --- Floating Node Component ---
const FloatingNode = ({ label, value, x, y, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      y: [0, -15, 0] // Continuous floating animation
    }}
    transition={{ 
      duration: 0.8, 
      delay, 
      ease: "easeOut",
      y: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: delay + 0.8 // Start floating after entry
      }
    }}
    className="absolute hidden md:flex flex-col items-center z-20"
    style={{ left: x, top: y }}
  >
    <div className="relative">
      <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10 relative" />
      <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-50" />
      {/* Connecting Line Effect (Decorative) */}
      <div className="absolute top-1/2 left-1/2 w-32 h-[1px] bg-gradient-to-r from-white/20 to-transparent -translate-y-1/2 -z-10" />
    </div>
    <div className="mt-2 text-left">
      <p className="text-gray-300 text-sm font-medium">{label}</p>
      <p className="text-gray-500 text-xs">{value}</p>
    </div>
  </motion.div>
);

function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn =
    !!localStorage.getItem("token") || !!localStorage.getItem("user");

  const handleStartInterviewClick = () => {
    if (isLoggedIn) {
      setIsModalOpen(true);
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="font-sans bg-black text-white h-screen overflow-y-auto selection:bg-gray-500/30 scrollbar-hide">
      
      {/* Spacer for Fixed Navbar */}
      <div className="h-32" />

      {/* --- CARD 1: HERO SECTION --- */}
      <div className="mx-4 mb-4 relative rounded-[3rem] overflow-hidden border border-white/10 group bg-black min-h-[calc(100vh-10rem)] flex flex-col">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
           <img 
              src="https://cdn.myfonts.net/cdn-cgi/image/width=417,height=208,fit=contain,format=auto/images/pim/10028/AIWs2bde2MZ0kEc9TuW5ZLdn_366e55375794201f183003928a249527.png" 
              alt="Background" 
              className="w-full h-full object-cover opacity-60 scale-110 blur-sm" 
           />
           {/* Gradient Overlay */}
           <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
           <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Hero Content */}
        <section className="flex-grow flex flex-col items-center justify-center text-center px-6 py-20 relative z-10">
          
          {/* Floating Nodes */}
          <FloatingNode label="Mock AI" value="Active" x="20%" y="20%" delay={0.5} />
          <FloatingNode label="Analysis" value="Deep" x="80%" y="25%" delay={0.7} />
          <FloatingNode label="Feedback" value="Real-time" x="15%" y="60%" delay={0.9} />
          <FloatingNode label="Practice" value="Unlimited" x="85%" y="55%" delay={1.1} />

          {/* Top Pill */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-gray-300 text-sm font-medium backdrop-blur-md">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Unlock Your Potential Spark! <FiArrowRight />
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-tight text-white max-w-5xl drop-shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            One-click for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
              Interview Success
            </span>
          </motion.h1>
          
          {/* Subheading */}
          <motion.p 
            className="text-lg md:text-xl text-gray-300 max-w-2xl mb-12 leading-relaxed drop-shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            Dive into the art of preparation, where innovative AI technology meets career expertise.
          </motion.p>
          
          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 items-center"
          >
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-white/5 text-white border border-white/10 rounded-full font-medium text-lg hover:bg-white/10 transition-all backdrop-blur-md flex items-center gap-2 group"
            >
              Open Dashboard <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={handleStartInterviewClick}
              className="px-8 py-3 bg-white text-black rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:bg-gray-200 transition-all transform hover:scale-105 active:scale-95"
            >
              Start Practice
            </button>
          </motion.div>
        </section>

        {/* Bottom Indicators */}
        <div className="w-full px-10 pb-10 flex justify-between items-end pointer-events-none mt-auto z-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-3 text-gray-400 text-sm"
          >
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center animate-bounce">
              <FiArrowDown />
            </div>
            <span>Scroll for Features</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="hidden md:flex flex-col items-end gap-2"
          >
            <span className="text-gray-400 text-sm font-medium">AI Horizons</span>
            <div className="flex gap-1">
              <div className="w-8 h-1 bg-white rounded-full" />
              <div className="w-8 h-1 bg-white/20 rounded-full" />
              <div className="w-8 h-1 bg-white/20 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- CARD 2: FEATURES SECTION (Redesigned "DeFi Wallet" Style) --- */}
      <div className="mx-4 mb-4 relative rounded-[3rem] overflow-hidden border border-white/10 bg-black">
        <section className="py-20 px-6 md:px-10 relative z-10 min-h-screen flex flex-col justify-center">
          
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white">Interview Mastery</h2>
            <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto">
              Exploratory mission with AI Horizon & navigating through the vast possibilities of career success.
            </p>
            <div className="mt-8">
               <button className="px-6 py-2 bg-white text-black rounded-full text-sm font-bold">How it works?</button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto w-full items-center">
            
            {/* LEFT: Organic Metrics Hub */}
            <motion.div 
              className="relative h-[400px] md:h-[500px] flex items-center justify-center"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
               {/* Large Elliptical Orbit */}
               <div className="absolute inset-0 border border-white/10 rounded-[50%] rotate-[-10deg] scale-90 md:scale-100" />
               
               {/* Main Score */}
               <div className="absolute top-1/2 left-10 md:left-20 transform -translate-y-1/2">
                  <p className="text-gray-500 text-sm mb-1">Interview Score</p>
                  <h3 className="text-6xl md:text-8xl font-bold text-white">+98.5</h3>
               </div>

               {/* Floating Cards */}
               <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  animate={{ y: [0, -10, 0] }}
                  className="absolute top-10 right-10 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                        <FiActivity className="text-white" />
                     </div>
                     <div>
                        <p className="text-white font-bold">Fluency</p>
                        <p className="text-gray-400 text-xs">High Confidence</p>
                     </div>
                  </div>
               </motion.div>

               <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  animate={{ y: [0, 10, 0] }}
                  className="absolute bottom-20 right-20 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                        <FiCheck className="text-white" />
                     </div>
                     <div>
                        <p className="text-white font-bold">Correctness</p>
                        <p className="text-gray-400 text-xs">95% Accuracy</p>
                     </div>
                  </div>
               </motion.div>

               {/* Connecting Lines (Decorative) */}
               <div className="absolute bottom-10 left-1/2 w-[1px] h-20 bg-gradient-to-b from-white/20 to-transparent" />
            </motion.div>

            {/* RIGHT: Radial Progress Cycle */}
            <motion.div 
              className="relative h-[400px] md:h-[500px] flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
               {/* Radial Circle */}
               <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border border-white/5 relative flex items-center justify-center">
                  {/* Progress Arc (Simulated with border) */}
                  <motion.div 
                    className="absolute inset-0 rounded-full border-t-4 border-r-4 border-white/80"
                    initial={{ rotate: 0 }}
                    whileInView={{ rotate: 45 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <div className="absolute inset-4 rounded-full border border-white/5" />
                  
                  {/* Inner Content */}
                  <motion.div 
                    className="text-center z-10"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                  >
                     <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold">
                        <FiCpu />
                     </div>
                     <h4 className="text-2xl font-bold text-white">Step 01</h4>
                     <p className="text-gray-500 text-sm">AI Analysis</p>
                  </motion.div>

                  {/* Radial Glow */}
                  <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full -z-10" />
               </div>

               {/* Orbiting Labels */}
               <div className="absolute top-10 right-10 text-right">
                  <p className="text-gray-500 text-xs">Target</p>
                  <p className="text-white font-bold">2025</p>
                  <p className="text-gray-500 text-xs">Career API</p>
               </div>
            </motion.div>

          </div>

          {/* Bottom Tags (Floating Pills) */}
          <div className="mt-20 flex flex-wrap justify-center gap-4 md:gap-8">
             {['2.7k Questions', 'Success', 'Personalized Learning', 'Smart Feedback', 'Career Growth', 'AI Revolution'].map((tag, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + (i * 0.1) }}
                  className={`px-6 py-2 rounded-full border border-white/10 text-sm font-medium flex items-center gap-2 ${tag === 'Personalized Learning' ? 'bg-white text-black' : 'bg-white/5 text-gray-400'}`}
                >
                   {tag === 'Personalized Learning' && <span className="text-lg">✦</span>}
                   {tag}
                </motion.div>
             ))}
          </div>

        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-bold text-white tracking-tight">
            Pro<span className="text-gray-400">coder</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Procoder AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {isModalOpen && <AddInterview onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}

export default LandingPage