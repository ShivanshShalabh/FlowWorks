"use client";

import { motion } from "framer-motion";

interface DemoButtonProps {
  onDemoClick: () => void;
}

export default function DemoButton({ onDemoClick }: DemoButtonProps) {
  return (
    <motion.button
      onClick={onDemoClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-6 py-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-pink-700 rounded-lg 
               text-white font-medium border-2 border-blue-600/50
               shadow-[0_0_10px_rgba(29,78,216,0.3)] hover:shadow-[0_0_15px_rgba(29,78,216,0.4)] 
               transition-all duration-300 flex items-center gap-2"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
      Watch Demo Video
    </motion.button>
  );
}
