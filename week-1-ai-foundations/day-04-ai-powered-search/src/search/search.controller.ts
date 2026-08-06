import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { SearchService } from './search.service'

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query('q') q: string, @Query('limit') limit?: string) {
    if (!q || !q.trim()) {
      throw new BadRequestException('q query param is required')
    }
    return this.searchService.search(q, limit ? Number(limit) : 5)
  }
}
