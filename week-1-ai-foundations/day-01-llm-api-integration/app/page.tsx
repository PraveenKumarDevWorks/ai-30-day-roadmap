'use client'

import { useRef, useState } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return

    const nextMessages: Message[] = [...messages, { role: 'user', content: trimmed }]
    // Add a placeholder assistant message we'll fill in as tokens stream in.
    setMessages([...nextMessages, { role: 'assistant', content: '' }])
    setInput('')
    setIsStreaming(true)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: nextMessages }),
    })

    if (!res.body) {
      setIsStreaming(false)
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })

      // Append the newly arrived text to the last (assistant) message.
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        updated[updated.length - 1] = { ...last, content: last.content + chunk }
        return updated
      })

      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    setIsStreaming(false)
  }

  return (
    <main className="mx-auto flex h-screen max-w-2xl flex-col p-4">
      <h1 className="mb-4 text-lg font-medium">Day 1 — Ollama Chat</h1>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-neutral-800 p-4">
        {messages.length === 0 && (
          <p className="text-sm text-neutral-500">
            Say hello. This calls your local Ollama model and streams the reply token by token.
          </p>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span
              className={
                'inline-block max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ' +
                (m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-100')
              }
            >
              {m.content || (isStreaming && i === messages.length - 1 ? '…' : '')}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          sendMessage()
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-600"
        />
        <button
          type="submit"
          disabled={isStreaming}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {isStreaming ? 'Sending…' : 'Send'}
        </button>
      </form>
    </main>
  )
}
