import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function OpeningPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup'); // Navigate to signup page
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Animated Heading */}
      <motion.h1
        className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-center px-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      >
        Welcome to Study Buddy
      </motion.h1>

      {/* Animated Description */}
      <motion.p
        className="text-lg sm:text-xl lg:text-2xl text-gray-400 mb-12 text-center px-6"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: 'easeInOut' }}
      >
        Your AI powered study tool to help you ace exams!
      </motion.p>

      {/* Animated Button with Bounce Effect */}
      <motion.button
        className="px-8 sm:px-10 py-3 sm:py-4 bg-red-500 text-white rounded-lg text-lg sm:text-xl font-bold shadow-lg hover:bg-red-700 transition-transform"
        onClick={handleGetStarted}
        whileHover={{
          y: -5,
          transition: { yoyo: Infinity, duration: 0.4 },
        }}
        whileTap={{ scale: 0.95 }}
      >
        Get Started
      </motion.button>
    </div>
  );
}

export default OpeningPage;
