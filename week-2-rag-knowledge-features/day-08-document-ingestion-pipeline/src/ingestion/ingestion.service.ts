import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { OllamaService } from '../ollama/ollama.service'
import { chunkWithOverlap } from '../lib/chunk'
import { mapWithConcurrency } from '../lib/concurrency'
import { toVectorLiteral } from '../pgvector'

export type IngestProgressEvent =
  | { stage: 'chunking'; totalChunks: number }
  | { stage: 'embedding'; done: number; total: number }
  | { stage: 'saving'; done: number; total: number }
  | { stage: 'complete'; source: string; totalChunks: number }
  | { stage: 'error'; message: string }

// Keep at most 3 embedding calls in flight at once — local Ollama runs on
// one machine (probably a laptop), so this is a gentle load, not a race.
const EMBED_CONCURRENCY = 3

@Injectable()
export class IngestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ollama: OllamaService
  ) {}

  async ingest(
    source: string,
    text: string,
    emit: (event: IngestProgressEvent) => void
  ): Promise<void> {
    const chunks = chunkWithOverlap(text, 200, 40)
    emit({ stage: 'chunking', totalChunks: chunks.length })

    if (chunks.length === 0) {
      emit({ stage: 'error', message: 'No text found to ingest — the file or text was empty.' })
      return
    }

    let embedded = 0
    const embeddings = await mapWithConcurrency(chunks, EMBED_CONCURRENCY, async (chunk) => {
      const vector = await this.ollama.embed(chunk)
      embedded++
      emit({ stage: 'embedding', done: embedded, total: chunks.length })
      return vector
    })

    for (let i = 0; i < chunks.length; i++) {
      const vectorLiteral = toVectorLiteral(embeddings[i])
      await this.prisma.$executeRaw`
        INSERT INTO document_chunks (source, chunk_index, content, embedding)
        VALUES (${source}, ${i}, ${chunks[i]}, ${vectorLiteral}::vector)
      `
      emit({ stage: 'saving', done: i + 1, total: chunks.length })
    }

    emit({ stage: 'complete', source, totalChunks: chunks.length })
  }

  async listChunks(source: string) {
    return this.prisma.$queryRaw<
      { id: number; source: string; chunkIndex: number; content: string; createdAt: Date }[]
    >`
      SELECT id, source, chunk_index AS "chunkIndex", content, created_at AS "createdAt"
      FROM document_chunks
      WHERE source = ${source}
      ORDER BY chunk_index ASC
    `
  }
}
