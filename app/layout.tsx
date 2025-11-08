import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlowScribe - AI-Powered n8n Workflow Generator',
  description: 'Transform natural language prompts into valid n8n workflow JSON with AI magic',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-sorcery-dark text-white">{children}</body>
    </html>
  )
}

