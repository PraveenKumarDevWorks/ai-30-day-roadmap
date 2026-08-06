import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { OllamaService } from '../ollama/ollama.service'
import { toVectorLiteral } from '../pgvector'

type SearchRow = { id: number; content: string; distance: number }

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ollama: OllamaService
  ) {}

  async search(query: string, limit = 5) {
    // Turn the SEARCH QUERY into a vector too — using the exact same
    // embedding model as when documents were stored. Comparing vectors
    // from two different embedding models would be meaningless; their
    // "meaning space" is defined per-model.
    const queryEmbedding = await this.ollama.embed(query)
    const vectorLiteral = toVectorLiteral(queryEmbedding)

    // `<=>` is pgvector's cosine distance operator. Lower = more similar.
    // We order by that distance directly — the DB does the ranking, we
    // never pull all rows into Node and sort them ourselves.
    const rows = await this.prisma.$queryRaw<SearchRow[]>`
      SELECT id, content, (embedding <=> ${vectorLiteral}::vector) AS distance
      FROM documents
      ORDER BY embedding <=> ${vectorLiteral}::vector
      LIMIT ${limit}
    `

    // pgvector's cosine distance and cosine similarity are two sides of
    // the same coin: similarity = 1 - distance. Distance is what's fast to
    // sort by in SQL; similarity (0 to 1, higher = more alike) is easier
    // for a human reading the results to make sense of.
    return rows.map((r) => ({
      id: r.id,
      content: r.content,
      similarity: 1 - r.distance,
    }))
  }
}
