import { Body, Controller, Post, Res } from '@nestjs/common'
import type { Response } from 'express'
import { RagService } from './rag.service'
import { ChatDto } from './dto/chat.dto'

@Controller()
export class RagController {
  constructor(private readonly rag: RagService) {}

  // POST /chat — streams NDJSON: one { token } line per generated token,
  // then one final { done: true, sources, refused } line. Same NDJSON
  // progress-stream idea as Day 8's /ingest, applied to chat tokens here.
  @Post('chat')
  async chat(@Body() dto: ChatDto, @Res() res: Response) {
    res.writeHead(200, {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
    })

    const emit = (event: unknown) => {
      res.write(JSON.stringify(event) + '\n')
    }

    try {
      const { chunks, refused } = await this.rag.answer(dto.question, (token) => {
        emit({ token })
      })
      emit({
        done: true,
        refused,
        sources: chunks.map((c) => ({
          source: c.source,
          chunkIndex: c.chunkIndex,
          similarity: Number(c.similarity.toFixed(3)),
        })),
      })
    } catch (err) {
      emit({ done: true, error: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      res.end()
    }
  }
}
