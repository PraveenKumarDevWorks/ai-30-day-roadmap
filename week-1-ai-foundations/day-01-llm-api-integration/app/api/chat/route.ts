import { NextRequest } from 'next/server'

// Where Ollama's local server is running. Ollama installs itself as a
// background service and listens on this port — no API key needed because
// it's your own machine, not a hosted service.
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'

// Which model to use. Pull it once before running this: `ollama pull llama3.2`
// (Set OLLAMA_MODEL in .env.local to override — check what you actually have
// pulled with `ollama list`.)
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2'

// Route Handlers can run on the Edge runtime or the Node.js runtime. We force
// Node.js here because we're doing a plain server-to-server fetch with a
// long-lived stream, which is the simpler, more predictable option for this.
export const runtime = 'nodejs'

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as { messages: ChatMessage[] }

  if (!messages?.length) {
    return new Response('messages is required', { status: 400 })
  }

  // Step 1: Ask Ollama to generate a reply, with stream: true.
  //
  // Unlike a typical REST API that sends one JSON response when it's done,
  // Ollama starts replying immediately and keeps the HTTP connection open,
  // sending one small JSON object per line as each token (or few tokens) is
  // generated. This format is called NDJSON — "newline-delimited JSON".
  // Example of what arrives over time:
  //   {"message":{"role":"assistant","content":"Hel"},"done":false}
  //   {"message":{"role":"assistant","content":"lo"},"done":false}
  //   {"message":{"role":"assistant","content":"!"},"done":true, ...stats}
  const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: true,
    }),
  })

  if (!ollamaResponse.ok || !ollamaResponse.body) {
    const errText = await ollamaResponse.text().catch(() => '')
    return new Response(
      `Ollama request failed (${ollamaResponse.status}). Is "ollama serve" running, ` +
        `and have you run "ollama pull ${OLLAMA_MODEL}"? ${errText}`,
      { status: 502 }
    )
  }

  // Step 2: Turn Ollama's NDJSON stream into a plain text stream for the browser.
  //
  // We don't want the frontend to know or care about Ollama's response format.
  // So here in the backend, we read Ollama's stream chunk by chunk, pull the
  // `message.content` text out of each JSON line, and write ONLY that text
  // into a brand new outgoing stream. The browser just sees a stream of
  // plain text tokens arriving one after another.
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const ollamaReader = ollamaResponse.body.getReader()

  // Network chunks don't line up neatly with NDJSON lines — a single chunk
  // from the network might end in the middle of a line. We hold onto any
  // trailing partial line in `buffer` and prepend it to the next chunk.
  let buffer = ''

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await ollamaReader.read()

      if (done) {
        controller.close()
        return
      }

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      // The last element might be an incomplete line — keep it for next time.
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const parsed = JSON.parse(line)
          const token: string | undefined = parsed?.message?.content
          if (token) {
            controller.enqueue(encoder.encode(token))
          }
        } catch {
          // A line that isn't valid JSON shouldn't normally happen — skip it
          // rather than crashing the whole stream over one bad chunk.
        }
      }
    },
    cancel() {
      // If the browser disconnects (e.g. user closes the tab mid-reply),
      // stop pulling from Ollama too instead of generating tokens nobody
      // will read.
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
