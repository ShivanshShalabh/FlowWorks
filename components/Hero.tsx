"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { motion } from "framer-motion";
import { useRef as useInputRef } from "react";

interface HeroProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  isCompact?: boolean;
}

export interface HeroRef {
  setPrompt: (prompt: string) => void;
  triggerGenerate: () => void;
}

const Hero = forwardRef<HeroRef, HeroProps>(
  ({ onGenerate, isGenerating, isCompact = false }, ref) => {
    const [prompt, setPrompt] = useState("");
    const inputRef = useInputRef<HTMLInputElement>(null);

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
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-6xl md:text-7xl font-bold text-center mb-8 glow-text"
            >
              FlowScribe
            </motion.h1>
          )}

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative"
          >
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your workflow in natural language..."
                disabled={isGenerating}
                className="w-full px-6 py-4 pr-32 bg-sorcery-darker border-2 border-sorcery-purple/50 rounded-lg 
                       text-white placeholder-gray-400 focus:outline-none focus:border-sorcery-purple 
                       focus:glow-border transition-all duration-300 disabled:opacity-50"
              />
              <motion.button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-sorcery-purple to-sorcery-blue 
                       rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed
                       hover:glow-border transition-all duration-300"
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
