export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'

export interface Source {
  source: string
  chunkIndex: number
  similarity: number
}

export interface StreamCallbacks {
  onToken: (token: string) => void
  onDone: (info: { refused: boolean; sources: Source[] }) => void
  onError: (message: string) => void
}

// Reads the backend's NDJSON stream (one JSON object per line) and calls
// the right callback for each line — same reading pattern used across the
// roadmap (Day 5, Day 8) for consuming a streamed response.
export async function streamChat(question: string, callbacks: StreamCallbacks): Promise<void> {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })

  if (!res.ok || !res.body) {
    callbacks.onError(`Request failed (${res.status}). Is the backend running on ${API_URL}?`)
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.trim()) continue
      const event = JSON.parse(line) as {
        token?: string
        done?: boolean
        refused?: boolean
        sources?: Source[]
        error?: string
      }

      if (event.error) {
        callbacks.onError(event.error)
      } else if (event.done) {
        callbacks.onDone({ refused: !!event.refused, sources: event.sources || [] })
      } else if (event.token) {
        callbacks.onToken(event.token)
      }
    }
  }
}

export async function seedDocuments(): Promise<{ seeded: { source: string; chunks: number }[] }> {
  const res = await fetch(`${API_URL}/documents/seed`, { method: 'POST' })
  if (!res.ok) throw new Error(`Seeding failed (${res.status})`)
  return res.json()
}
