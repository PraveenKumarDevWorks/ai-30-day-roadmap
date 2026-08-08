import { Module } from '@nestjs/common'
import { RagService } from './rag.service'
import { RagController } from './rag.controller'
import { OllamaModule } from '../ollama/ollama.module'

@Module({
  imports: [OllamaModule],
  providers: [RagService],
  controllers: [RagController],
})
export class RagModule {}
