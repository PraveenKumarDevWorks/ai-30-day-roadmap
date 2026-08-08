'use client'

import { useState, useRef, useEffect } from 'react'
import { streamChat, seedDocuments, Source } from '@/lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  refused?: boolean
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [seedStatus, setSeedStatus] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSeed() {
    setSeedStatus('Seeding sample documents...')
    try {
      const result = await seedDocuments()
      setSeedStatus(`Seeded ${result.seeded.length} documents. You can ask questions now.`)
    } catch (err) {
      setSeedStatus(err instanceof Error ? err.message : 'Seeding failed.')
    }
  }

  async function handleSend() {
    const question = input.trim()
    if (!question || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
    setLoading(true)

    await streamChat(question, {
      onToken: (token) => {
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = {
            ...next[next.length - 1],
            content: next[next.length - 1].content + token,
          }
          return next
        })
      },
      onDone: ({ refused, sources }) => {
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = { ...next[next.length - 1], refused, sources }
          return next
        })
        setLoading(false)
      },
      onError: (message) => {
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = { ...next[next.length - 1], content: `Error: ${message}` }
          return next
        })
        setLoading(false)
      },
    })
  }

  return (
    <main className="mx-auto flex h-screen max-w-2xl flex-col p-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Day 9 — Basic RAG Chatbot</h1>
        <p className="text-sm text-gray-500">
          Answers come only from documents stored in the database. No documents yet? Seed the samples below.
        </p>
        <button
          onClick={handleSeed}
          className="mt-2 rounded bg-gray-800 px-3 py-1 text-sm text-white hover:bg-gray-700"
        >
          Seed sample documents
        </button>
        {seedStatus && <p className="mt-1 text-sm text-gray-600">{seedStatus}</p>}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded border bg-white p-4">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400">Ask a question below to get started.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div
              className={
                'inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm ' +
                (m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900')
              }
            >
              {m.content || (loading && i === messages.length - 1 ? '...' : '')}
            </div>
            {m.role === 'assistant' && m.sources && m.sources.length > 0 && !m.refused && (
              <div className="mt-1 text-xs text-gray-400">
                Sources:{' '}
                {m.sources
                  .map((s) => `${s.source} #${s.chunkIndex} (${(s.similarity * 100).toFixed(0)}%)`)
                  .join(', ')}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about the seeded documents..."
          className="flex-1 rounded border px-3 py-2 text-sm"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </main>
  )
}
