import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { OllamaService } from '../ollama/ollama.service'
import { toVectorLiteral } from '../pgvector'
import { SAMPLE_DOCUMENTS } from './sample-documents'

type DocumentRow = { id: number; content: string }

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ollama: OllamaService
  ) {}

  async create(content: string): Promise<DocumentRow> {
    // 1. Turn the text into a vector (a list of numbers that encodes its
    //    meaning). This is the ONE extra step semantic search needs that a
    //    normal database insert doesn't.
    const embedding = await this.ollama.embed(content)
    const vectorLiteral = toVectorLiteral(embedding)

    // 2. Insert content + embedding together in one raw SQL statement.
    //    This has to be raw SQL (not prisma.document.create(...)) because
    //    the `embedding` column is an Unsupported() type in schema.prisma —
    //    Prisma Client deliberately won't generate typed helpers for it.
    const rows = await this.prisma.$queryRaw<DocumentRow[]>`
      INSERT INTO documents (content, embedding)
      VALUES (${content}, ${vectorLiteral}::vector)
      RETURNING id, content
    `
    return rows[0]
  }

  async seed(): Promise<DocumentRow[]> {
    const created: DocumentRow[] = []
    for (const text of SAMPLE_DOCUMENTS) {
      created.push(await this.create(text))
    }
    return created
  }
}
