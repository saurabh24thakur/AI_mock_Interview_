import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCode, FiDatabase, FiLayout, FiServer, FiUsers, FiCpu } from 'react-icons/fi';

const topics = [
  { id: 'frontend', name: 'Frontend Developer', icon: <FiLayout />, role: 'Frontend Developer' },
  { id: 'backend', name: 'Backend Developer', icon: <FiServer />, role: 'Backend Developer' },
  { id: 'fullstack', name: 'Full Stack Developer', icon: <FiDatabase />, role: 'Full Stack Developer' },
  { id: 'dsa', name: 'Data Structures', icon: <FiCode />, role: 'Data Structures & Algorithms' },
  { id: 'system-design', name: 'System Design', icon: <FiCpu />, role: 'System Design' },
  { id: 'hr', name: 'HR / Behavioral', icon: <FiUsers />, role: 'HR' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 100 }
  }
};

function PracticeQuestions() {
  const navigate = useNavigate();

  const handleStartPractice = (role) => {
    navigate('/interview', { state: { jobRole: role } });
  };

  return (
    <motion.div
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Practice Questions</h2>
      <p className="text-gray-400 mb-8">Select a topic to start a quick practice session.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <motion.div
            key={topic.id}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleStartPractice(topic.role)}
            className="bg-gray-900/70 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg cursor-pointer hover:border-lime-400/50 transition-colors group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-lime-400/10 text-lime-400 text-2xl group-hover:bg-lime-400 group-hover:text-black transition-colors">
                {topic.icon}
              </div>
              <h3 className="text-xl font-semibold text-white">{topic.name}</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Practice common interview questions for {topic.name} roles.
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default PracticeQuestions;
