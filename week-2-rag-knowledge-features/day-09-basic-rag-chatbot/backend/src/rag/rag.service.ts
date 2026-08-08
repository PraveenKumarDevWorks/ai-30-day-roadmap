import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { OllamaService, ChatMessage } from '../ollama/ollama.service'
import { toVectorLiteral } from '../pgvector'

interface RetrievedChunk {
  id: number
  source: string
  chunkIndex: number
  content: string
  similarity: number
}

// If the best-matching chunk isn't at least this similar to the question,
// we treat it as "the documents don't cover this" instead of guessing.
const MIN_SIMILARITY = 0.3
const TOP_K = 4

@Injectable()
export class RagService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ollama: OllamaService
  ) {}

  async retrieve(question: string): Promise<RetrievedChunk[]> {
    const queryEmbedding = await this.ollama.embed(question)
    const vectorLiteral = toVectorLiteral(queryEmbedding)

    // pgvector's <=> operator returns cosine DISTANCE (0 = identical,
    // 2 = opposite). We flip it to similarity (1 = identical) because
    // similarity is easier to reason about with a "must be at least X"
    // threshold — same conversion Day 4's search feature used.
    type Row = { id: number; source: string; chunkIndex: number; content: string; distance: number }

    const rows: Row[] = await this.prisma.$queryRaw<Row[]>`
      SELECT id, source, chunk_index AS "chunkIndex", content,
             embedding <=> ${vectorLiteral}::vector AS distance
      FROM document_chunks
      ORDER BY embedding <=> ${vectorLiteral}::vector ASC
      LIMIT ${TOP_K}
    `

    return rows.map((row: Row) => ({
      id: row.id,
      source: row.source,
      chunkIndex: row.chunkIndex,
      content: row.content,
      similarity: 1 - row.distance,
    }))
  }

  buildPrompt(question: string, chunks: RetrievedChunk[]): ChatMessage[] {
    const context = chunks
      .map((c, i) => `[Chunk ${i + 1} — source: ${c.source}]\n${c.content}`)
      .join('\n\n')

    const systemPrompt =
      'You are a helpful assistant that answers questions using ONLY the context chunks provided below. ' +
      'If the context does not contain enough information to answer the question, say clearly that you ' +
      "don't have enough information in the documents to answer, instead of guessing or using outside " +
      'knowledge.\n\n' +
      `Context:\n${context}`

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ]
  }

  /**
   * Runs the full RAG loop: embed the question, retrieve top-k chunks,
   * decide whether they're relevant enough to answer from, then stream
   * the model's reply token by token via onToken.
   */
  async answer(
    question: string,
    onToken: (token: string) => void
  ): Promise<{ chunks: RetrievedChunk[]; refused: boolean }> {
    const chunks = await this.retrieve(question)
    const bestSimilarity = chunks.length > 0 ? chunks[0].similarity : 0

    if (bestSimilarity < MIN_SIMILARITY) {
      const refusal =
        "I don't have enough information in the documents to answer that. " +
        'Try seeding the sample documents first, or ask something closer to what has been ingested.'
      onToken(refusal)
      return { chunks: [], refused: true }
    }

    const messages = this.buildPrompt(question, chunks)
    await this.ollama.chatStream(messages, onToken)
    return { chunks, refused: false }
  }
}
