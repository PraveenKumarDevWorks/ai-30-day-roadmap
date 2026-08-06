'use client'

import { useState } from 'react'

type SummaryMode = 'extractive' | 'abstractive'
type InputMode = 'text' | 'url'
type ProgressEvent = {
  stage: string
  totalChunks?: number
  index?: number
  bullets?: string[]
  message?: string
}

export default function SummarizerPage() {
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [textValue, setTextValue] = useState('')
  const [urlValue, setUrlValue] = useState('')
  const [mode, setMode] = useState<SummaryMode>('abstractive')
  const [running, setRunning] = useState(false)
  const [progressLines, setProgressLines] = useState<string[]>([])
  const [bullets, setBullets] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  function logProgress(line: string) {
    setProgressLines((prev) => [...prev, line])
  }

  function handleEvent(event: ProgressEvent) {
    switch (event.stage) {
      case 'fetching-url':
        logProgress('Fetching the page…')
        break
      case 'chunking':
        logProgress(
          event.totalChunks === 1
            ? 'Text fits in one piece — no chunking needed.'
            : `Splitting text into ${event.totalChunks} pieces…`
        )
        break
      case 'chunk-summarized':
        logProgress(`Summarized piece ${event.index} of ${event.totalChunks}.`)
        break
      case 'reducing':
        logProgress('Combining all pieces into one final summary…')
        break
      case 'done':
        logProgress('Done.')
        setBullets(event.bullets ?? [])
        break
      case 'error':
        logProgress('Error: ' + event.message)
        break
    }
  }

  async function summarize() {
    setRunning(true)
    setProgressLines([])
    setBullets([])
    setCopied(false)

    try {
      const body = inputMode === 'text' ? { text: textValue, mode } : { url: urlValue, mode }

      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          handleEvent(JSON.parse(line) as ProgressEvent)
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'something went wrong'
      logProgress('Error: ' + message)
    } finally {
      setRunning(false)
    }
  }

  function copyToClipboard() {
    const text = bullets.map((b) => '- ' + b).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-lg font-medium">Day 5 — Text Summarizer</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Paste text or a URL. Long text gets split into pieces, summarized separately, then combined.
      </p>

      <div className="mb-4 flex gap-2 text-xs">
        <button
          onClick={() => setInputMode('text')}
          className={`rounded px-3 py-1.5 ${inputMode === 'text' ? 'bg-blue-600' : 'bg-neutral-800'}`}
        >
          Paste text
        </button>
        <button
          onClick={() => setInputMode('url')}
          className={`rounded px-3 py-1.5 ${inputMode === 'url' ? 'bg-blue-600' : 'bg-neutral-800'}`}
        >
          From a URL
        </button>
      </div>

      {inputMode === 'text' ? (
        <textarea
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          rows={8}
          placeholder="Paste an article or any long text here…"
          className="mb-4 w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-sm outline-none focus:border-neutral-600"
        />
      ) : (
        <input
          value={urlValue}
          onChange={(e) => setUrlValue(e.target.value)}
          placeholder="https://example.com/some-article"
          className="mb-4 w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-sm outline-none focus:border-neutral-600"
        />
      )}

      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs">
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            checked={mode === 'abstractive'}
            onChange={() => setMode('abstractive')}
          />
          Abstractive (rewritten in the model&apos;s own words)
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            checked={mode === 'extractive'}
            onChange={() => setMode('extractive')}
          />
          Extractive (original sentences, picked out as-is)
        </label>
      </div>

      <button
        onClick={summarize}
        disabled={running}
        className="mb-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {running ? 'Summarizing…' : 'Summarize'}
      </button>

      {progressLines.length > 0 && (
        <div className="mb-4 rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-xs text-neutral-400">
          {progressLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {bullets.length > 0 && (
        <div className="rounded-lg border border-neutral-800 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Summary</h2>
            <button onClick={copyToClipboard} className="rounded bg-neutral-800 px-2 py-1 text-xs">
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
