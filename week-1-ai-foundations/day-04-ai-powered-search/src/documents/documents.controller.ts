import { Body, Controller, Post } from '@nestjs/common'
import { DocumentsService } from './documents.service'
import { CreateDocumentDto } from './dto/create-document.dto'

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Body() dto: CreateDocumentDto) {
    return this.documentsService.create(dto.content)
  }

  // Convenience endpoint for the demo — inserts a handful of sample FAQ
  // sentences so /search has something meaningful to find right away.
  @Post('seed')
  seed() {
    return this.documentsService.seed()
  }
}
