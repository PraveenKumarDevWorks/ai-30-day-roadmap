import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import type { Request, Response } from 'express'
import { IngestionService } from './ingestion.service'
import { extractTextFromFile } from './extractText'
import { ListChunksDto } from './dto/list-chunks.dto'

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB

@Controller()
export class IngestionController {
  constructor(private readonly ingestion: IngestionService) {}

  // POST /ingest — accepts a file upload OR a plain text field, and streams
  // back progress as NDJSON (one JSON object per line), the same idea as
  // Day 5's summarizer progress stream, but here it's file-based.
  @Post('ingest')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_BYTES },
    })
  )
  async ingestFile(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const source = (req.body?.source as string) || file?.originalname
    const rawText = req.body?.text as string | undefined

    if (!source) {
      throw new BadRequestException('Provide a "source" name (or upload a file with a filename).')
    }
    if (!file && !rawText) {
      throw new BadRequestException('Provide either a file upload or a "text" field.')
    }

    res.writeHead(200, {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
    })

    const emit = (event: unknown) => {
      res.write(JSON.stringify(event) + '\n')
    }

    try {
      const text = file ? await extractTextFromFile(file) : (rawText as string)
      await this.ingestion.ingest(source, text, emit)
    } catch (err) {
      emit({ stage: 'error', message: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      res.end()
    }
  }

  // GET /chunks?source=... — lists the chunks saved for one source, so you
  // can see what actually got stored after an ingest run.
  @Get('chunks')
  async listChunks(@Query() query: ListChunksDto) {
    return this.ingestion.listChunks(query.source)
  }
}
