import { Body, Controller, Post } from '@nestjs/common'
import { DocumentsService } from './documents.service'
import { AddDocumentDto } from './dto/add-document.dto'

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Post('seed')
  seed() {
    return this.documents.seed()
  }

  @Post()
  add(@Body() dto: AddDocumentDto) {
    return this.documents.addDocument(dto.source, dto.content)
  }
}
