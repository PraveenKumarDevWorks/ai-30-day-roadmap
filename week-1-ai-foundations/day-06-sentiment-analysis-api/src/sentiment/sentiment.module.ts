import { Module } from '@nestjs/common'
import { SentimentController } from './sentiment.controller'
import { SentimentService } from './sentiment.service'
import { OllamaModule } from '../ollama/ollama.module'

@Module({
  imports: [OllamaModule],
  controllers: [SentimentController],
  providers: [SentimentService],
})
export class SentimentModule {}
