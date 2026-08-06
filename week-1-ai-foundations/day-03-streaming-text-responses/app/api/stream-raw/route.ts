import { NextRequest } from 'next/server'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { prompt, simulateDrop } = (await req.json()) as {
    prompt: string
    simulateDrop?: boolean
  }

  if (!prompt) {
    return new Response('prompt is required', { status: 400 })
  }

  const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: true }),
  })

  if (!ollamaResponse.ok || !ollamaResponse.body) {
    const errText = await ollamaResponse.text().catch(() => '')
    return new Response(
      `Ollama request failed (${ollamaResponse.status}). Is "ollama serve" running? ${errText}`,
      { status: 502 }
    )
  }

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const ollamaReader = ollamaResponse.body.getReader()
  let buffer = ''
  let charsSent = 0

  // Roughly simulate a flaky network: once we've sent more than this many
  // characters, kill the stream early WITHOUT a clean finish — like a wifi
  // drop cutting off a plain fetch response. Compare this to the SSE route
  // (/api/stream-sse), which recovers from the same kind of drop on its own.
  const DROP_AFTER_CHARS = 60

  const stream = new ReadableStream({
    async pull(controller) {
      if (simulateDrop && charsSent > DROP_AFTER_CHARS) {
        // controller.error() ends the stream as a failure. The browser's
        // fetch() will see this as a rejected read — there is no built-in
        // retry. Whoever is reading this stream has to notice the failure
        // and decide what to do (see the "Retry manually" button in the UI).
        controller.error(new Error('simulated network drop'))
        ollamaReader.cancel()
        return
      }

      const { done, value } = await ollamaReader.read()
      if (done) {
        controller.close()
        return
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const parsed = JSON.parse(line)
          const token: string | undefined = parsed?.response
          if (token) {
            charsSent += token.length
            controller.enqueue(encoder.encode(token))
          }
        } catch {
          // Skip any line that isn't valid JSON.
        }
      }
    },
    cancel() {
      ollamaReader.cancel()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
