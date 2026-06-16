import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function CurtainLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set a timeout to remove the loader from the DOM after the animation completes
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500); // Animation duration + some buffer

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex overflow-hidden pointer-events-none"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          {/* Left Curtain */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: '-100%' }}
            transition={{ duration: 1.5, ease: [0.77, 0, 0.175, 1], delay: 0.5 }}
            className="absolute left-0 top-0 w-1/2 h-full bg-orange-900 border-r border-orange-400/30 shadow-[10px_0_30px_rgba(0,0,0,0.5)] flex items-center justify-end"
          >
            {/* Decorative pattern or texture could go here */}
            <div className="h-full w-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          </motion.div>

          {/* Right Curtain */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, ease: [0.77, 0, 0.175, 1], delay: 0.5 }}
            className="absolute right-0 top-0 w-1/2 h-full bg-orange-900 border-l border-orange-400/30 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex items-center justify-start"
          >
            <div className="h-full w-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          </motion.div>

          {/* Logo Lock */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ 
                scale: 0, 
                opacity: 0,
                rotate: 360
              }}
              transition={{ duration: 0.8, ease: "backIn", delay: 0.3 }}
              className="z-10 bg-white p-6 rounded-full shadow-[0_0_50px_rgba(251,146,60,0.5)] border-4 border-orange-400"
            >
              <img 
                src="https://i.ibb.co/Y4fS5FDr/file-000000003bec71faa9b37e16b055cb49.png" 
                alt="Mithila Catering Logo" 
                className="h-24 w-24 object-contain"
              />
            </motion.div>
          </div>

          {/* Center Line Glow */}
          <motion.div 
            initial={{ opacity: 1, scaleY: 1 }}
            animate={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-orange-400/50 -translate-x-1/2 z-[5]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
