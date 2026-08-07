import { Injectable, ServiceUnavailableException } from '@nestjs/common'

@Injectable()
export class OllamaService {
  private readonly baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
  private readonly embedModel = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text'

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
}
