import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Day 1 — Ollama Chat',
  description: 'LLM API integration with Ollama, Next.js, and streaming',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100">{children}</body>
    </html>
  )
}
