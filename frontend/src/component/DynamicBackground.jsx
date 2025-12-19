import React from "react";
import { motion } from "framer-motion";

const DynamicBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black">
      {/* Ambient Mist 1 - Top Left */}
      <motion.div
        className="absolute -top-[10%] -left-[10%] w-[80vw] h-[80vw] rounded-full bg-white/5 blur-[120px]"
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
          scale: [1, 1.05, 1],
          opacity: [0.05, 0.08, 0.05],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Ambient Mist 2 - Bottom Right */}
      <motion.div
        className="absolute -bottom-[10%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-slate-500/10 blur-[100px]"
        animate={{
          x: [0, -20, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Fog 1 */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-[40rem] h-[40rem] rounded-full bg-gray-400/5 blur-[90px]"
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 30, 0],
          opacity: [0.03, 0.06, 0.03],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating Fog 2 */}
      <motion.div
        className="absolute bottom-1/3 right-1/3 w-[35rem] h-[35rem] rounded-full bg-slate-300/5 blur-[80px]"
        animate={{
          x: [0, -50, 20, 0],
          y: [0, 50, -30, 0],
          opacity: [0.02, 0.05, 0.02],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Subtle Grain Texture */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
    </div>
  );
};

export default DynamicBackground;
