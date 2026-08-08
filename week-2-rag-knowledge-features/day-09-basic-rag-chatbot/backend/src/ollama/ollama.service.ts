import { Injectable, ServiceUnavailableException } from '@nestjs/common'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

@Injectable()
export class OllamaService {
  private readonly baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
  private readonly embedModel = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text'
  private readonly chatModel = process.env.OLLAMA_CHAT_MODEL || 'llama3.2'

  async embed(text: string): Promise<number[]> {
    const res = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.embedModel, prompt: text }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new ServiceUnavailableException(
        `Ollama embeddings request failed (${res.status}). Is "ollama serve" running, ` +
          `and have you run "ollama pull ${this.embedModel}"? ${errText}`
      )
    }

    const data = (await res.json()) as { embedding: number[] }
    return data.embedding
  }

  /**
   * Streams a chat reply token-by-token. `onToken` is called once per
   * token as it arrives — same NDJSON-relay idea as Day 1/2, just wrapped
   * as an async function instead of piping the raw stream straight through,
   * because here we need to also send our own "sources" event afterwards.
   */
  async chatStream(messages: ChatMessage[], onToken: (token: string) => void): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.chatModel, messages, stream: true }),
    })

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => '')
      throw new ServiceUnavailableException(
        `Ollama chat request failed (${res.status}). Is "ollama serve" running, ` +
          `and have you run "ollama pull ${this.chatModel}"? ${errText}`
      )
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
        const parsed = JSON.parse(line) as { message?: { content?: string }; done?: boolean }
        if (parsed.message?.content) onToken(parsed.message.content)
      }
    }
  }
}
