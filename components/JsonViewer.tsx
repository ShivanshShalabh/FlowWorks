'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { motion, AnimatePresence } from 'framer-motion'

interface JsonViewerProps {
  workflowJson?: object | null
}

export default function JsonViewer({ workflowJson }: JsonViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!workflowJson) return

    try {
      await navigator.clipboard.writeText(JSON.stringify(workflowJson, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!workflowJson) {
    return (
      <div className="w-full h-full bg-sorcery-darker rounded-lg border border-sorcery-purple/30 p-6 flex items-center justify-center">
        <p className="text-gray-400">No workflow JSON to display</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-sorcery-darker rounded-lg border border-sorcery-purple/30 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-sorcery-purple/30">
        <h3 className="text-lg font-semibold text-white">Workflow JSON</h3>
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-sorcery-purple hover:bg-sorcery-purple/80 rounded-lg text-white text-sm font-medium
                   transition-all duration-200 flex items-center gap-2"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language="json"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: '#050508',
            height: '100%',
          }}
        >
          {JSON.stringify(workflowJson, null, 2)}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

