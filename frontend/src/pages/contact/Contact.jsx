import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiLinkedin, FiGithub, FiInstagram, FiMail, FiGlobe, FiCopy, FiCheck } from "react-icons/fi";
import DynamicBackground from "../../component/DynamicBackground";

const Contact = () => {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText("saurabh5532u@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    { 
      name: "LinkedIn", 
      icon: <FiLinkedin />, 
      link: "https://www.linkedin.com/in/saurabh-singh-476157374", 
      desc: "Professional Network",
      coord: "top-0 left-0"
    },
    { 
      name: "GitHub", 
      icon: <FiGithub />, 
      link: "https://github.com/saurabh24thakur", 
      desc: "Source Code & Projects",
      coord: "top-0 right-0"
    },
    { 
      name: "Portfolio", 
      icon: <FiGlobe />, 
      link: "https://my-portfolio-phi-seven-50.vercel.app/", 
      desc: "Interactive Showcase",
      coord: "bottom-0 left-0"
    },
    { 
      name: "Instagram", 
      icon: <FiInstagram />, 
      link: "https://www.instagram.com/mr_saurabh_420_k", 
      desc: "Personal & Social",
      coord: "bottom-0 right-0"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white/20 overflow-hidden">
      <DynamicBackground />

      {/* Structural Wireframe Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute left-1/2 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-6 max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-6">
            <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
            Contact Protocol Active
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter">
            Digital <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 italic">Nodes</span>
          </h1>
          <p className="text-gray-500 text-base md:text-lg max-w-lg mx-auto leading-relaxed border-l border-white/10 pl-6 text-left md:text-center">
            Architecture of connection. Reach out through the following localized access points.
          </p>
        </motion.div>

        {/* Wireframe Social Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
        >
          {socialLinks.map((social, index) => (
            <motion.a
              key={index}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              className="group relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl hover:bg-white hover:text-black transition-all duration-500 flex flex-col justify-between min-h-[240px]"
            >
              <div className="flex justify-between items-start">
                <div className="text-3xl group-hover:scale-110 transition-transform duration-500">
                  {social.icon}
                </div>
                <div className="text-[9px] font-mono opacity-40 group-hover:opacity-100 uppercase tracking-widest">
                  Secure Link 0{index + 1}
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-1 tracking-tight">{social.name}</h3>
                <p className="text-gray-500 text-xs group-hover:text-black/60 transition-colors">
                  {social.desc}
                </p>
              </div>

              {/* Decorative Corner Element */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <FiGlobe className="animate-spin-slow text-sm" />
              </div>
            </motion.a>
          ))}

          {/* Email Node - Large Full Width */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 group relative p-10 rounded-[2rem] bg-white/[0.04] border border-white/10 backdrop-blur-3xl flex flex-col md:flex-row items-center justify-between gap-6 mt-4 overflow-hidden"
          >
            {/* Subtle internal grid for wireframe feel */}
            <div className="absolute inset-0 opacity-5 pointer-events-none flex">
              <div className="border-r border-white h-full w-1/4" />
              <div className="border-r border-white h-full w-1/4" />
              <div className="border-r border-white h-full w-1/4" />
            </div>

            <div className="relative z-10 flex flex-col gap-1 text-center md:text-left">
              <p className="text-gray-500 text-[9px] uppercase tracking-[0.3em] font-medium">Primary Access</p>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tighter">saurabh5532u@gmail.com</h2>
            </div>
            
            <button
              onClick={copyEmail}
              className="relative z-10 flex items-center gap-2 px-6 py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              {copied ? (
                <>Copied! <FiCheck /></>
              ) : (
                <>Copy Email <FiCopy /></>
              )}
            </button>
          </motion.div>
        </motion.div>


        {/* Footer Structural Element */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-32 w-full flex flex-col items-center gap-8"
        >
          <div className="w-px h-20 bg-gradient-to-b from-white/20 to-transparent" />
          <div className="flex gap-12 text-[10px] font-mono text-gray-600 uppercase tracking-[0.4em]">
            <span>Est. 2025</span>
            <span className="text-white/20">/</span>
            <span>MockMate Core</span>
            <span className="text-white/20">/</span>
            <span>v2.0.4</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
