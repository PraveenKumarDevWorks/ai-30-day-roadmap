import { Module } from '@nestjs/common'
import { IngestionService } from './ingestion.service'
import { IngestionController } from './ingestion.controller'
import { OllamaModule } from '../ollama/ollama.module'

@Module({
  imports: [OllamaModule],
  providers: [IngestionService],
  controllers: [IngestionController],
})
export class IngestionModule {}
