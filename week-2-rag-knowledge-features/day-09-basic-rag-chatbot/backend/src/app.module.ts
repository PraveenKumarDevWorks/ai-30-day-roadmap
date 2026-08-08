import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { DocumentsModule } from './documents/documents.module'
import { RagModule } from './rag/rag.module'

@Module({
  imports: [PrismaModule, DocumentsModule, RagModule],
})
export class AppModule {}
