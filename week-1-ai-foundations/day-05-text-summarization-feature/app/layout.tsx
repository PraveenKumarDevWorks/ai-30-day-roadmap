import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Day 5 — Text Summarizer',
  description: 'Summarize pasted text or a URL, with chunking and map-reduce for long text',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100">{children}</body>
    </html>
  )
}
