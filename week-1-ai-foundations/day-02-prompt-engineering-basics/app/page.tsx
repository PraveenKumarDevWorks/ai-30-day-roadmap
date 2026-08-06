'use client'

import { useState } from 'react'
import { buildPrompt, DEFAULT_TASK, PromptMode } from '@/lib/prompts'

const MODES: { id: PromptMode; label: string; blurb: string }[] = [
  { id: 'zero-shot', label: 'Zero-shot', blurb: 'No examples. Just the instruction.' },
  { id: 'few-shot', label: 'Few-shot', blurb: 'A few worked examples before the real question.' },
  { id: 'chain-of-thought', label: 'Chain-of-thought', blurb: 'Asked to reason step by step first.' },
]

type Outputs = Record<PromptMode, string>

const EMPTY_OUTPUTS: Outputs = { 'zero-shot': '', 'few-shot': '', 'chain-of-thought': '' }

export default function PlaygroundPage() {
  const [task, setTask] = useState(DEFAULT_TASK)
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(0.9)
  const [showPrompts, setShowPrompts] = useState(false)
  const [outputs, setOutputs] = useState<Outputs>(EMPTY_OUTPUTS)
  const [running, setRunning] = useState(false)

  async function runOne(mode: PromptMode) {
    const prompt = buildPrompt(mode, task)
    setOutputs((prev) => ({ ...prev, [mode]: '' }))

    const res = await fetch('/api/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, temperature, top_p: topP }),
    })

    if (!res.body) return

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      setOutputs((prev) => ({ ...prev, [mode]: prev[mode] + chunk }))
    }
  }

  async function runAll() {
    if (running) return
    setRunning(true)
    // Fire all three at once, so you can watch the columns fill in live and
    // compare them as they go, instead of waiting for one to finish before
    // starting the next.
    await Promise.all(MODES.map((m) => runOne(m.id)))
    setRunning(false)
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-2 text-lg font-medium">Day 2 — Prompt Playground</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Same task, three different prompting styles, run side by side against your local model.
      </p>

      <div className="mb-6 space-y-3 rounded-lg border border-neutral-800 p-4">
        <label className="block text-sm font-medium">Task</label>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-sm outline-none focus:border-neutral-600"
        />

        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            temperature: {temperature.toFixed(2)}
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.05}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            top_p: {topP.toFixed(2)}
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={topP}
              onChange={(e) => setTopP(Number(e.target.value))}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showPrompts}
              onChange={(e) => setShowPrompts(e.target.checked)}
            />
            show exact prompt sent
          </label>
        </div>

        <button
          onClick={runAll}
          disabled={running}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {running ? 'Running all three…' : 'Run all three'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {MODES.map((m) => (
          <div key={m.id} className="rounded-lg border border-neutral-800 p-4">
            <h2 className="text-sm font-semibold">{m.label}</h2>
            <p className="mb-2 text-xs text-neutral-500">{m.blurb}</p>

            {showPrompts && (
              <pre className="mb-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-neutral-900 p-2 text-[11px] text-neutral-400">
                {buildPrompt(m.id, task)}
              </pre>
            )}

            <div className="min-h-[120px] whitespace-pre-wrap rounded bg-neutral-900 p-2 text-sm">
              {outputs[m.id] || <span className="text-neutral-600">—</span>}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
