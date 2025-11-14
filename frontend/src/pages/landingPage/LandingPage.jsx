import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AddInterview from '../../component/AddInterview';
import { useNavigate } from 'react-router-dom';

// --- Animation variants for the feature cards ---
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ // 'i' is the custom index for staggered delay
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.15,
      ease: "easeOut",
    },
  }),
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

    // 1. MAIN WRAPPER: Dark theme
    <div className="font-sans bg-black text-white min-h-screen overflow-x-hidden">
 
      
      {/* 2. ANIMATED BACKGROUND (Like the image)
        This is the "aurora" effect, animated.
      */}
      <div className="absolute top-0 left-0 w-full h-full z-0 opacity-50">
        <div className="animated-aurora"></div>
        {/* We use <style jsx> here to keep the CSS with its component.
            You can also move this to your global index.css file.
        */}
        <style jsx>{`
          .animated-aurora {
            width: 100%;
            height: 100%;
            position: fixed; /* Ensures it covers the full viewport height */
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
      <div className="relative z-10">

        {/* 4. NEW HERO SECTION (Centered, high-impact) */}
        <section className="flex flex-col items-center justify-center min-h-screen text-center px-6">
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* Split-color text, like the image */}
            <span className="text-lime-400">Ace Your Interview</span> <br />
            More Presentable
          </motion.h1>
          
          <motion.p 
            className="text-lg text-gray-300 max-w-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            Ace your first interview using Mockmate...
          </motion.p>
          
          <motion.button 
            onClick={handleStartInterviewClick}
            className="
              bg-lime-400 text-black 
              px-8 py-3 rounded-full 
              font-semibold shadow-lg 
              hover:bg-lime-300 
              transition-all duration-200 
              transform hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          >
            Start Interview
          </motion.button>
        </section>

        {isModalOpen && <AddInterview onClose={() => setIsModalOpen(false)} />}

        {/* 5. "GLASS" FEATURES SECTION (Redesigned) */}
        <section className="py-24 px-6 md:px-10 text-center">
          <motion.h2 
            className="text-4xl font-semibold mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            Imagine Features
          </motion.h2>
          <motion.p 
            className="text-gray-300 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Everything you need to ace your interview, all in one place.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Box 1 (Glass Card with Hover Effect) */}
            <motion.div 
              className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl 
                         border border-white/10 shadow-lg
                         transition-colors duration-300
                         hover:border-lime-400/50"
              custom={0} // Stagger index
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              whileHover={{ scale: 1.05, y: -8 }} // Hover Effect
            >
              <div className="bg-lime-400/10 text-lime-400 w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-6">
                ⟳
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Interview System</h3>
              <p className="text-gray-400 text-sm">
                It give u oppotunnity to test you in frony of Ai to ace your intervew..
              </p>
            </motion.div>

            {/* Box 2 (Glass Card with Hover Effect) */}
            <motion.div 
              className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl 
                         border border-white/10 shadow-lg
                         transition-colors duration-300
                         hover:border-lime-400/50"
              custom={1} // Stagger index
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              whileHover={{ scale: 1.05, y: -8 }} // Hover Effect
            >
              <div className="bg-lime-400/10 text-lime-400 w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-6">
                📊
              </div>
              <h3 className="text-xl font-semibold mb-3">Full functional dashboard</h3>
              <p className="text-gray-400 text-sm">
                You can tally all your progress and old interview sessions..
              </p>
            </motion.div>

            {/* Box 3 (Glass Card with Hover Effect) */}
            <motion.div 
              className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl 
                         border border-white/10 shadow-lg
                         transition-colors duration-300
                         hover:border-lime-400/50"
              custom={2} // Stagger index
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              whileHover={{ scale: 1.05, y: -8 }} // Hover Effect
            >
              <div className="bg-lime-400/10 text-lime-400 w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-6">
                🛒
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Purchase</h3>
              <p className="text-gray-400 text-sm">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Perferendis quis molestiae vitae eligendi at.
              </p>
            </motion.div>

          </div>
        </section>

        {/* Your Footer component would go here */}

      </div>
    </div>
  )
}

export default LandingPage