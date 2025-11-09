"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hero, { HeroRef } from "@/components/Hero";
import JsonViewer from "@/components/JsonViewer";
import DemoButton from "@/components/DemoButton";
import VersionHistoryViewer from "@/components/VersionHistoryViewer";
import DebugSection from "@/components/DebugSection";
import { generateWorkflow, debugWorkflow, StatusUpdate } from "@/lib/api";
import StatusDisplay from "@/components/StatusDisplay";
import ParticleBackground from "@/components/ParticleBackground";

type ViewState = "prompt" | "generating" | "results" | "error";

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("prompt");
  const [originalPrompt, setOriginalPrompt] = useState<string>("");
  const [currentWorkflow, setCurrentWorkflow] = useState<object | null>(null);
  const [versionHistory, setVersionHistory] = useState<object[]>([]);
  const [isDebugging, setIsDebugging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const heroRef = useRef<HeroRef>(null);

  const handleGenerate = async (prompt: string) => {
    setViewState("generating");
    setErrorMessage("");
    setOriginalPrompt(prompt);
    setStatusUpdates([]); // Clear previous status updates

    try {
      const result = await generateWorkflow(prompt, (update: StatusUpdate) => {
        setStatusUpdates((prev) => [...prev, update]);
      });
      const newWorkflow = result.workflowJson;

      // Set current workflow and initialize version history
      setCurrentWorkflow(newWorkflow);
      setVersionHistory([newWorkflow]);
      setViewState("results");

      // Smooth scroll to results
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error generating workflow:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setViewState("error");
    }
  };

  const handleDebugSubmit = async (bugMessage: string) => {
    if (!currentWorkflow || !originalPrompt) return;

    setIsDebugging(true);
    try {
      const result = await debugWorkflow(
        originalPrompt,
        currentWorkflow,
        bugMessage
      );
      const fixedWorkflow = result.workflowJson;

      // Update current workflow
      setCurrentWorkflow(fixedWorkflow);

      // Add to version history
      setVersionHistory((prev) => [...prev, fixedWorkflow]);

      // Workflow updated successfully
    } catch (error) {
      console.error("Error debugging workflow:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to fix workflow"
      );
      // Don't change view state, just show error in debug section
    } finally {
      setIsDebugging(false);
    }
  };

  const handleSelectVersion = (workflow: object) => {
    setCurrentWorkflow(workflow);
  };

  const handleDemo = () => {
    const demoPrompt =
      "Send a Slack notification when a new GitHub issue is created";
    if (heroRef.current) {
      heroRef.current.setPrompt(demoPrompt);
      setTimeout(() => {
        if (heroRef.current) {
          heroRef.current.triggerGenerate();
        }
      }, 500);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sorcery-dark via-sorcery-darker to-sorcery-dark">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Animated background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-sorcery-purple/5 via-transparent to-sorcery-blue/5 pointer-events-none z-[1]" />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {viewState === "prompt" && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero
                ref={heroRef}
                onGenerate={handleGenerate}
                isGenerating={false}
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center mt-6"
              >
                <DemoButton onDemoClick={handleDemo} />
              </motion.div>
            </motion.div>
          )}

          {viewState === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-20 pb-16"
            >
              <div className="max-w-4xl mx-auto px-4">
                <Hero
                  ref={heroRef}
                  onGenerate={handleGenerate}
                  isGenerating={true}
                  isCompact={true}
                  initialPrompt={originalPrompt}
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 text-sorcery-glow mb-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-6 h-6 border-2 border-sorcery-purple border-t-transparent rounded-full"
                      />
                      <span className="text-xl font-medium">
                        Crafting your workflow...
                      </span>
                    </div>
                  </div>
                  {statusUpdates.length > 0 && (
                    <StatusDisplay statusUpdates={statusUpdates} />
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {viewState === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pt-20 pb-16"
            >
              <div className="max-w-4xl mx-auto px-4">
                <Hero
                  ref={heroRef}
                  onGenerate={handleGenerate}
                  isGenerating={false}
                  isCompact={true}
                  initialPrompt={originalPrompt}
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 text-center"
                >
                  <div className="bg-red-900/20 border-2 border-red-500/50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-red-400 mb-2">
                      {errorMessage.includes(
                        "couldn't find a suitable workflow"
                      )
                        ? "No Match Found"
                        : "Error"}
                    </h3>
                    <p className="text-red-300 mb-4">{errorMessage}</p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => setViewState("prompt")}
                        className="px-6 py-2 bg-gradient-to-r from-pink-700 via-rose-700 to-purple-700 
                                 rounded-lg text-white font-medium shadow-[0_0_8px_rgba(190,24,93,0.3)] 
                                 hover:shadow-[0_0_12px_rgba(190,24,93,0.4)] transition-all duration-300"
                      >
                        Try Again
                      </button>
                      {errorMessage.includes(
                        "couldn't find a suitable workflow"
                      ) && (
                        <button
                          onClick={() => {
                            setViewState("prompt");
                            if (heroRef.current) {
                              heroRef.current.setPrompt("");
                            }
                          }}
                          className="px-6 py-2 bg-gradient-to-r from-blue-700 via-indigo-700 to-pink-700 
                                   rounded-lg text-white font-medium border-2 border-blue-600/50
                                   shadow-[0_0_8px_rgba(29,78,216,0.3)] hover:shadow-[0_0_12px_rgba(29,78,216,0.4)] 
                                   transition-all duration-300"
                        >
                          New Prompt
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {viewState === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pt-8 pb-8"
            >
              <div className="max-w-7xl mx-auto px-4">
                {/* Original Prompt Header Bar */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-sorcery-darker border-2 border-sorcery-purple/30 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-sorcery-purple flex-shrink-0"
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
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">
                        Original Prompt
                      </p>
                      <p className="text-white font-medium">{originalPrompt}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Version History Viewer */}
                <VersionHistoryViewer
                  versionHistory={versionHistory}
                  currentWorkflow={currentWorkflow}
                  onSelectVersion={handleSelectVersion}
                />

                {/* Two-Column Layout: JSON Viewer (left) and Debug Section (right) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-300px)]"
                >
                  {/* JSON Viewer on Left */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <JsonViewer workflowJson={currentWorkflow} />
                  </motion.div>

                  {/* Debug Section on Right */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col"
                  >
                    <DebugSection
                      originalPrompt={originalPrompt}
                      currentWorkflow={currentWorkflow}
                      onDebugSubmit={handleDebugSubmit}
                      isDebugging={isDebugging}
                    />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
