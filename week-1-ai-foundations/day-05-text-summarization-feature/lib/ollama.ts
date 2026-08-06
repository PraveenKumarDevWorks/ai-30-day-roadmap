const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2'

// Earlier days always used stream: true and read Ollama's reply piece by
// piece. This project makes several Ollama calls in a row (one per chunk,
// then one more to combine them) and streams its OWN progress events
// instead (see app/api/summarize/route.ts) — so each individual Ollama call
// here just waits for its one complete answer with stream: false, which is
// a single normal JSON response, nothing to parse piece by piece.
export async function callOllama(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(
      `Ollama request failed (${res.status}). Is "ollama serve" running? ${errText}`
    )
  }

  const data = (await res.json()) as { response: string }
  return data.response
}
