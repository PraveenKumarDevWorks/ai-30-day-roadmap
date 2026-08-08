import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Day 9 — Basic RAG Chatbot',
  description: 'Ask questions answered only from your own documents',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}
