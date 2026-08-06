import { Injectable } from '@nestjs/common'
import { createHash } from 'crypto'
import { RedisService } from '../redis/redis.service'
import { OllamaService } from '../ollama/ollama.service'
import { parseSentiment } from './parseSentiment'
import { SentimentResult } from './sentiment.types'

const CACHE_TTL_SECONDS = 60 * 60 // 1 hour

@Injectable()
export class SentimentService {
  constructor(
    private readonly redis: RedisService,
    private readonly ollama: OllamaService
  ) {}

  // This is the "cache-aside" pattern: check the cache first; on a miss,
  // do the real (slow) work, then write the result into the cache before
  // returning it, so the NEXT identical request is fast.
  async analyze(text: string): Promise<SentimentResult & { cached: boolean }> {
    const key = this.cacheKey(text)

    const cached = await this.redis.get(key)
    if (cached) {
      return { ...(JSON.parse(cached) as SentimentResult), cached: true }
    }

    const prompt = this.buildPrompt(text)
    const raw = await this.ollama.generateJson(prompt)
    const result = parseSentiment(raw)

    // setex = "SET with an EXpiry": store the value, and tell Redis to
    // delete it automatically after CACHE_TTL_SECONDS. No cleanup job
    // needed — Redis does the expiring for us.
    await this.redis.setex(key, CACHE_TTL_SECONDS, JSON.stringify(result))

    return { ...result, cached: false }
  }

  private buildPrompt(text: string): string {
    return (
      'Analyze the sentiment of the text below. Respond with JSON only, no other text, ' +
      'in exactly this shape: {"label": "positive" | "negative" | "neutral", ' +
      '"score": <number between -1 and 1>}.\n\n' +
      `Text: ${text}`
    )
  }

  // Hashing the (normalized) input text keeps the Redis key a fixed, short
  // length no matter how long the input text is, and guarantees the same
  // text always maps to the same key — which is exactly what a cache key
  // needs to do.
  private cacheKey(text: string): string {
    const normalized = text.trim().toLowerCase()
    const hash = createHash('sha256').update(normalized).digest('hex')
    return `sentiment:${hash}`
  }
}
