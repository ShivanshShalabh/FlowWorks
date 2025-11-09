"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { motion } from "framer-motion";
import { useRef as useInputRef } from "react";

interface HeroProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  isCompact?: boolean;
  initialPrompt?: string;
}

export interface HeroRef {
  setPrompt: (prompt: string) => void;
  triggerGenerate: () => void;
}

const Hero = forwardRef<HeroRef, HeroProps>(
  (
    { onGenerate, isGenerating, isCompact = false, initialPrompt = "" },
    ref
  ) => {
    const [prompt, setPrompt] = useState(initialPrompt);
    const inputRef = useInputRef<HTMLTextAreaElement>(null);

    // Update prompt when initialPrompt changes (e.g., when entering generating state)
    useEffect(() => {
      if (initialPrompt) {
        setPrompt(initialPrompt);
      }
    }, [initialPrompt]);

    // Auto-resize textarea when prompt changes
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = `${Math.min(
          inputRef.current.scrollHeight,
          192
        )}px`;
      }
    }, [prompt]);

    useImperativeHandle(ref, () => ({
      setPrompt: (value: string) => {
        setPrompt(value);
      },
      triggerGenerate: () => {
        if (prompt.trim() && !isGenerating) {
          onGenerate(prompt.trim());
        }
      },
    }));

    // Keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Enter to generate
        if (
          e.key === "Enter" &&
          !e.shiftKey &&
          document.activeElement === inputRef.current
        ) {
          e.preventDefault();
          if (prompt.trim() && !isGenerating) {
            onGenerate(prompt.trim());
          }
        }
        // Escape to clear
        if (e.key === "Escape" && document.activeElement === inputRef.current) {
          setPrompt("");
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [prompt, isGenerating, onGenerate]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (prompt.trim() && !isGenerating) {
        onGenerate(prompt.trim());
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full ${isCompact ? "pt-8 pb-4" : "pt-20 pb-16"}`}
      >
        <div className="max-w-4xl mx-auto px-4">
          {!isCompact && (
            <>
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex justify-center mb-12"
              >
                <img
                  src="/logo.svg"
                  alt="FlowWorks"
                  className="h-24 md:h-32 w-auto"
                />
              </motion.div>

              {/* Main Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-4"
              >
                Automate Your World with Intelligent Workflows
              </motion.h2>

              {/* Sub-heading */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg md:text-xl text-white text-center mb-12"
              >
                Describe, generate, and execute tasks effortlessly
              </motion.p>
            </>
          )}

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: isCompact ? 0.1 : 0.4 }}
            className="relative"
          >
            <div className="relative">
              {/* Purple magic wand icon on the left */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <svg
                  className="w-5 h-5 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <textarea
                ref={inputRef}
                style={{
                  height: "auto",
                  overflow: "auto",
                  minHeight: "fit-content",
                }}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  // Auto-resize
                  const target = e.target;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(
                    target.scrollHeight,
                    192
                  )}px`;
                }}
                placeholder="Describe your workflow in natural language..."
                disabled={isGenerating}
                rows={1}
                className="w-full pl-12 pr-4 py-4 bg-sorcery-darker border-2 border-blue-500/50 rounded-lg 
                       text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 
                       focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 disabled:opacity-50
              resize-none overflow-y-auto min-h-[3.5rem] max-h-48"
              />
            </div>
            <div className="flex justify-end mt-3">
              <motion.button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-pink-700 via-rose-700 to-purple-700 
                       rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-[0_0_8px_rgba(190,24,93,0.3)] hover:shadow-[0_0_12px_rgba(190,24,93,0.4)] transition-all duration-300"
              >
                {isGenerating ? "Generating..." : "Generate Workflow"}
              </motion.button>
            </div>
          </motion.form>
        </div>
      </motion.div>
    );
  }
);

Hero.displayName = "Hero";

export default Hero;
