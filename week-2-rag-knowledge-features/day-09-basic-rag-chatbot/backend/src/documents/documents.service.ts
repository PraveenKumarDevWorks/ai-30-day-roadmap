import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { OllamaService } from '../ollama/ollama.service'
import { chunkWithOverlap } from '../lib/chunk'
import { toVectorLiteral } from '../pgvector'
import { SAMPLE_DOCUMENTS } from './sample-documents'

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ollama: OllamaService
  ) {}

  async addDocument(source: string, content: string): Promise<{ source: string; chunks: number }> {
    const chunks = chunkWithOverlap(content)

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await this.ollama.embed(chunks[i])
      const vectorLiteral = toVectorLiteral(embedding)
      await this.prisma.$executeRaw`
        INSERT INTO document_chunks (source, chunk_index, content, embedding)
        VALUES (${source}, ${i}, ${chunks[i]}, ${vectorLiteral}::vector)
      `
    }

    return { source, chunks: chunks.length }
  }

  async seed(): Promise<{ seeded: { source: string; chunks: number }[] }> {
    const seeded: { source: string; chunks: number }[] = []
    for (const doc of SAMPLE_DOCUMENTS) {
      seeded.push(await this.addDocument(doc.source, doc.content))
    }
    return { seeded }
  }
}
