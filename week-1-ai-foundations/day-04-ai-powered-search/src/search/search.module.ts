import { Module } from '@nestjs/common'
import { SearchController } from './search.controller'
import { SearchService } from './search.service'
import { OllamaModule } from '../ollama/ollama.module'

@Module({
  imports: [OllamaModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
