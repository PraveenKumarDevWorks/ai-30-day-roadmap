'use client'

import { useRef, useState } from 'react'
import { useTypewriter } from '@/lib/useTypewriter'

type Status = 'idle' | 'streaming' | 'reconnecting' | 'done' | 'error'

function FetchStreamPanel({ prompt, simulateDrop }: { prompt: string; simulateDrop: boolean }) {
  const tw = useTypewriter(45)
  const [status, setStatus] = useState<Status>('idle')

  async function run() {
    tw.reset()
    setStatus('streaming')
    try {
      const res = await fetch('/api/stream-raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, simulateDrop }),
      })
      if (!res.body) throw new Error('no response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        tw.push(decoder.decode(value, { stream: true }))
      }
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="rounded-lg border border-neutral-800 p-4">
      <h2 className="mb-1 text-sm font-semibold">Fetch + ReadableStream</h2>
      <p className="mb-3 text-xs text-neutral-500">
        Manual streaming, like Day 1 and Day 2. No built-in reconnect — if the connection drops, it just stops.
      </p>

      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={run}
          disabled={status === 'streaming'}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          {status === 'streaming' ? 'Streaming…' : 'Start'}
        </button>
        {status === 'error' && (
          <button
            onClick={run}
            className="rounded-lg bg-red-600/20 px-3 py-1.5 text-xs text-red-400"
          >
            Retry manually
          </button>
        )}
        <span className="text-xs text-neutral-500">status: {status}</span>
      </div>

      <div className="min-h-[140px] whitespace-pre-wrap rounded bg-neutral-900 p-2 text-sm">
        {tw.displayed || <span className="text-neutral-600">—</span>}
      </div>
    </div>
  )
}

function SsePanel({ prompt, simulateDrop }: { prompt: string; simulateDrop: boolean }) {
  const tw = useTypewriter(45)
  const [status, setStatus] = useState<Status>('idle')
  const [reconnects, setReconnects] = useState(0)
  const esRef = useRef<EventSource | null>(null)

  function run() {
    esRef.current?.close()
    tw.reset()
    setReconnects(0)
    setStatus('streaming')

    const url = `/api/stream-sse?prompt=${encodeURIComponent(prompt)}&simulateDrop=${
      simulateDrop ? '1' : '0'
    }`
    const es = new EventSource(url)
    esRef.current = es

    es.onmessage = (e) => {
      if (e.data === '[DONE]') {
        es.close()
        setStatus('done')
        return
      }
      try {
        const { token } = JSON.parse(e.data) as { token?: string }
        if (token) tw.push(token)
      } catch {
        // Ignore any malformed event.
      }
    }

    es.onerror = () => {
      // EventSource retries automatically by default. This handler fires
      // whenever the connection drops — readyState tells us whether the
      // browser is already trying again (CONNECTING) or has given up
      // (CLOSED, e.g. after a fatal error like a 4xx response).
      if (es.readyState === EventSource.CONNECTING) {
        setStatus('reconnecting')
        setReconnects((n) => n + 1)
      } else if (es.readyState === EventSource.CLOSED) {
        setStatus('error')
      }
    }
  }

  function stop() {
    esRef.current?.close()
    setStatus('idle')
  }

  return (
    <div className="rounded-lg border border-neutral-800 p-4">
      <h2 className="mb-1 text-sm font-semibold">Server-Sent Events (EventSource)</h2>
      <p className="mb-3 text-xs text-neutral-500">
        Built-in browser auto-reconnect. A drop restarts the answer from the beginning — it has no memory of
        progress.
      </p>

      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={run}
          disabled={status === 'streaming'}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          {status === 'streaming' ? 'Streaming…' : 'Start'}
        </button>
        <button
          onClick={stop}
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs"
        >
          Stop
        </button>
        <span className="text-xs text-neutral-500">
          status: {status}
          {reconnects > 0 ? ` · reconnected ${reconnects}×` : ''}
        </span>
      </div>

      <div className="min-h-[140px] whitespace-pre-wrap rounded bg-neutral-900 p-2 text-sm">
        {tw.displayed || <span className="text-neutral-600">—</span>}
      </div>
    </div>
  )
}

export default function StreamingDemoPage() {
  const [prompt, setPrompt] = useState('Explain what streaming means, in three short sentences.')
  const [simulateDrop, setSimulateDrop] = useState(false)

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-2 text-lg font-medium">Day 3 — Streaming Text Responses</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Two ways to stream the same AI reply, side by side, plus a typewriter effect that reveals text at a
        steady pace.
      </p>

      <div className="mb-6 space-y-3 rounded-lg border border-neutral-800 p-4">
        <label className="block text-sm font-medium">Prompt (used by both panels)</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-sm outline-none focus:border-neutral-600"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={simulateDrop}
            onChange={(e) => setSimulateDrop(e.target.checked)}
          />
          simulate a dropped connection partway through
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FetchStreamPanel prompt={prompt} simulateDrop={simulateDrop} />
        <SsePanel prompt={prompt} simulateDrop={simulateDrop} />
      </div>
    </main>
  )
}
