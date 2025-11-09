"use client";

import { motion, AnimatePresence } from "framer-motion";
import { StatusUpdate } from "@/lib/api";

interface StatusDisplayProps {
  statusUpdates: StatusUpdate[];
}

export default function StatusDisplay({ statusUpdates }: StatusDisplayProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-400 border-green-500/50 bg-green-900/20";
      case "error":
        return "text-red-400 border-red-500/50 bg-red-900/20";
      case "warning":
        return "text-yellow-400 border-yellow-500/50 bg-yellow-900/20";
      case "progress":
        return "text-blue-400 border-blue-500/50 bg-blue-900/20";
      case "info":
      default:
        return "text-sorcery-glow border-sorcery-purple/50 bg-sorcery-darker";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "error":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "progress":
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          />
        );
      case "info":
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2 max-h-[400px] overflow-y-auto">
      <AnimatePresence>
        {statusUpdates.map((update, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={`border rounded-lg p-3 ${getStatusColor(update.status)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(update.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{update.message}</p>
                {update.details && Object.keys(update.details).length > 0 && (
                  <div className="mt-1 text-xs opacity-75">
                    {update.details.tasks && (
                      <div className="mt-1">
                        Tasks: {Array.isArray(update.details.tasks) ? update.details.tasks.join(", ") : update.details.tasks}
                      </div>
                    )}
                    {update.details.workflowName && (
                      <div className="mt-1">
                        Workflow: {update.details.workflowName}
                      </div>
                    )}
                    {update.details.nodeCount !== undefined && (
                      <div className="mt-1">
                        Nodes: {update.details.nodeCount}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

