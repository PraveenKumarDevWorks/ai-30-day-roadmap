import { Module } from '@nestjs/common'
import { DocumentsService } from './documents.service'
import { DocumentsController } from './documents.controller'
import { OllamaModule } from '../ollama/ollama.module'

@Module({
  imports: [OllamaModule],
  providers: [DocumentsService],
  controllers: [DocumentsController],
  exports: [DocumentsService],
})
export class DocumentsModule {}
