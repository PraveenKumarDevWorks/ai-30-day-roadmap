import { NextRequest } from 'next/server'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const {
    prompt,
    temperature = 0.7,
    top_p: topP = 0.9,
  } = (await req.json()) as { prompt: string; temperature?: number; top_p?: number }

  if (!prompt) {
    return new Response('prompt is required', { status: 400 })
  }

  // Day 1 used /api/chat (a `messages` array, meant for back-and-forth
  // conversation). This route uses /api/generate instead — it takes ONE raw
  // prompt string and has no idea of "conversation history". That's exactly
  // what we want here: every prompt-mode comparison is a single, independent
  // request, not a chat.
  //
  // `options.temperature` and `options.top_p` control how the model picks
  // its next word at each step:
  //  - temperature near 0 → always pick the most likely next word (safe, a
  //    bit repetitive/boring, very consistent between runs)
  //  - temperature higher (e.g. 1.0+) → more willing to pick less-likely
  //    words (more varied/creative, but can wander or get incoherent)
  //  - top_p limits the choice to the smallest set of words whose combined
  //    probability adds up to top_p (e.g. 0.9 = "only consider words that
  //    make up the top 90% of likely next words"). It's a second knob on the
  //    same idea: how much randomness to allow.
  const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: true,
      options: { temperature, top_p: topP },
    }),
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

  const stream = new ReadableStream({
    async pull(controller) {
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
          // /api/generate's NDJSON lines use a "response" field for the
          // token text — different from /api/chat's "message.content" in
          // Day 1. Same idea, different shape per endpoint.
          const token: string | undefined = parsed?.response
          if (token) {
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
