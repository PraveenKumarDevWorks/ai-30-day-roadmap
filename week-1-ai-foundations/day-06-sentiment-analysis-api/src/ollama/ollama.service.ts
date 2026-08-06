import { Injectable, ServiceUnavailableException } from '@nestjs/common'

@Injectable()
export class OllamaService {
  private readonly baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
  private readonly model = process.env.OLLAMA_MODEL || 'llama3.2'

  // format: 'json' tells Ollama to constrain its output to be
  // SYNTACTICALLY valid JSON — the model literally can't produce broken
  // JSON syntax while this is on. It does NOT guarantee the JSON has the
  // exact keys/types we asked for — the model could still return
  // {"sentiment": "great!"} instead of {"label": "positive", "score": 0.8}.
  // That's why sentiment.service.ts still parses the result defensively.
  async generateJson(prompt: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, prompt, stream: false, format: 'json' }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new ServiceUnavailableException(
        `Ollama request failed (${res.status}). Is "ollama serve" running? ${errText}`
      )
    }

    const data = (await res.json()) as { response: string }
    return data.response
  }
}
