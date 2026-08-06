import { NextRequest } from 'next/server'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2'

export const runtime = 'nodejs'

// The browser's built-in EventSource (used to consume Server-Sent Events)
// can ONLY send GET requests — it has no way to send a body or custom
// headers. That's why the prompt travels as a query parameter here, unlike
// the POST-based /api/stream-raw route.
export async function GET(req: NextRequest) {
  const prompt = req.nextUrl.searchParams.get('prompt') ?? ''
  const simulateDrop = req.nextUrl.searchParams.get('simulateDrop') === '1'

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
  const DROP_AFTER_CHARS = 60

  const stream = new ReadableStream({
    start(controller) {
      // "retry: 2000" is a real part of the SSE wire format. It tells the
      // browser: "if this connection drops, wait 2 seconds, then open a
      // new one yourself." This is what powers EventSource's automatic
      // reconnect — no extra JavaScript needed on the client for this part.
      controller.enqueue(encoder.encode('retry: 2000\n\n'))
    },
    async pull(controller) {
      if (simulateDrop && charsSent > DROP_AFTER_CHARS) {
        // Close the connection early, without sending "[DONE]". The
        // browser's EventSource notices the connection died and, after the
        // retry delay above, automatically opens a brand-new GET request —
        // no code in the frontend has to detect this or react to it.
        controller.close()
        ollamaReader.cancel()
        return
      }

      const { done, value } = await ollamaReader.read()
      if (done) {
        // A clean, expected finish: tell the client there's nothing more
        // coming, then close normally.
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
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
            // This is the real SSE wire format: a line starting with
            // "data: ", then the payload, then a BLANK line. That blank
            // line marks "end of this event" — EventSource won't fire
            // onmessage until it sees it.
            const payload = JSON.stringify({ token })
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
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
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Tells reverse proxies like nginx not to buffer this response —
      // otherwise a proxy could hold onto chunks and defeat streaming
      // entirely in production.
      'X-Accel-Buffering': 'no',
    },
  })
}
