import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AddInterview from '../../component/AddInterview';
import { useNavigate } from 'react-router-dom';
import DynamicBackground from '../../component/DynamicBackground';
import { FiCpu, FiBarChart2, FiShoppingCart, FiArrowRight } from 'react-icons/fi';

// --- Animation variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 }
  }
};

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
    <div className="relative font-sans bg-black text-white min-h-screen overflow-x-hidden selection:bg-gray-500/30">
      <DynamicBackground />

      {/* CONTENT WRAPPER */}
      <div className="relative z-10">

        {/* HERO SECTION */}
        <section className="flex flex-col items-center justify-center min-h-screen text-center px-6 pt-20">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 relative"
          >
            <div className="absolute -inset-1 rounded-full bg-white/10 opacity-30 blur-xl animate-pulse"></div>
            <span className="relative px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-gray-300 text-sm font-medium uppercase tracking-wider">
              AI-Powered Interview Prep
            </span>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-8xl font-bold mb-8 tracking-tight leading-tight text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            Master Your Next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
              Big Opportunity
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Practice with our advanced AI interviewer, get real-time feedback on your fluency and body language, and land your dream job with confidence.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button 
              onClick={handleStartInterviewClick}
              className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:bg-gray-100 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Start Practice Now <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all transform hover:scale-105 active:scale-95 backdrop-blur-md"
            >
              View Dashboard
            </button>
          </motion.div>
        </section>

        {isModalOpen && <AddInterview onClose={() => setIsModalOpen(false)} />}

        {/* FEATURES SECTION */}
        <section className="py-32 px-6 md:px-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Everything You Need to <span className="text-gray-400">Succeed</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Our platform provides comprehensive tools to help you prepare for technical and behavioral interviews.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            
            {/* Feature 1 */}
            <motion.div 
              variants={itemVariants}
              className="group bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/5"
            >
              <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/20">
                <FiCpu className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">AI Interviewer</h3>
              <p className="text-gray-400 leading-relaxed">
                Experience realistic interview scenarios with our advanced AI. Get tested on technical knowledge and behavioral responses in real-time.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              variants={itemVariants}
              className="group bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/5"
            >
              <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/20">
                <FiBarChart2 className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Performance Analytics</h3>
              <p className="text-gray-400 leading-relaxed">
                Track your progress with detailed analytics. Visualize your improvement in fluency, correctness, and confidence over time.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              variants={itemVariants}
              className="group bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/5"
            >
              <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/20">
                <FiShoppingCart className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Premium Plans</h3>
              <p className="text-gray-400 leading-relaxed">
                Unlock unlimited interviews, advanced question sets, and priority support with our affordable premium plans.
              </p>
            </motion.div>

          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black/40 backdrop-blur-md py-12">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-2xl font-bold text-white tracking-tight">
              Mock<span className="text-gray-400">Mate</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} MockMate AI. All rights reserved.
            </p>
            <div className="flex gap-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}

export default LandingPage