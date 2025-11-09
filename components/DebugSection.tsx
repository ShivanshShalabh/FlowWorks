"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface DebugSectionProps {
  originalPrompt: string;
  currentWorkflow: object | null;
  onDebugSubmit: (bugMessage: string) => Promise<void>;
  isDebugging: boolean;
}

export default function DebugSection({
  originalPrompt,
  currentWorkflow,
  onDebugSubmit,
  isDebugging,
}: DebugSectionProps) {
  const [bugMessage, setBugMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bugMessage.trim() && currentWorkflow) {
      await onDebugSubmit(bugMessage.trim());
      setBugMessage("");
    }
  };

  if (!currentWorkflow) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 bg-sorcery-darker border-2 border-sorcery-purple/50 rounded-lg p-6"
    >
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <svg
          className="w-6 h-6 text-sorcery-purple"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Debug Workflow
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        Found an issue? Describe what needs to be fixed and we'll generate an
        updated version.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="bug-message"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            What to fix?
          </label>
          <textarea
            id="bug-message"
            value={bugMessage}
            onChange={(e) => setBugMessage(e.target.value)}
            placeholder="e.g., The Slack channel name is wrong, or the email subject should be different..."
            disabled={isDebugging}
            rows={3}
            className="w-full px-4 py-3 bg-sorcery-dark border-2 border-sorcery-purple/50 rounded-lg 
                     text-white placeholder-gray-400 focus:outline-none focus:border-sorcery-purple 
                     focus:glow-border transition-all duration-300 disabled:opacity-50 resize-none"
          />
        </div>
        <motion.button
          type="submit"
          disabled={!bugMessage.trim() || isDebugging || !currentWorkflow}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 
                   rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-[0_0_10px_rgba(236,72,153,0.4)] hover:shadow-[0_0_15px_rgba(236,72,153,0.6)] 
                   transition-all duration-300 flex items-center justify-center gap-2"
        >
          {isDebugging ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              Fixing...
            </>
          ) : (
            <>
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Submit Fix
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
