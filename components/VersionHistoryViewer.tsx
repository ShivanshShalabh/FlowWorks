'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface VersionHistoryViewerProps {
  versionHistory: object[]
  currentWorkflow: object | null
  onSelectVersion: (workflow: object) => void
}

export default function VersionHistoryViewer({
  versionHistory,
  currentWorkflow,
  onSelectVersion,
}: VersionHistoryViewerProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (versionHistory.length === 0) {
    return null
  }

  return (
    <div className="fixed right-4 top-20 z-50">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 bg-sorcery-purple hover:bg-sorcery-purple/80 rounded-lg text-white font-medium
                 shadow-lg flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        History ({versionHistory.length})
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mt-2 w-64 bg-sorcery-darker border-2 border-sorcery-purple rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-4 border-b border-sorcery-purple/30">
              <h3 className="text-lg font-semibold text-white">Version History</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {versionHistory.map((version, index) => {
                const isCurrent = JSON.stringify(version) === JSON.stringify(currentWorkflow)
                return (
                  <motion.button
                    key={index}
                    onClick={() => {
                      onSelectVersion(version)
                      setIsOpen(false)
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full px-4 py-3 text-left border-b border-sorcery-purple/20 last:border-b-0
                              transition-colors ${
                                isCurrent
                                  ? 'bg-sorcery-purple/20 border-l-4 border-l-sorcery-glow'
                                  : 'hover:bg-sorcery-purple/10'
                              }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">
                          Version {index + 1}
                          {index === 0 && ' (Initial)'}
                          {index > 0 && ` (Fix ${index})`}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-sorcery-glow mt-1">Current</p>
                        )}
                      </div>
                      {isCurrent && (
                        <svg className="w-5 h-5 text-sorcery-glow" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

