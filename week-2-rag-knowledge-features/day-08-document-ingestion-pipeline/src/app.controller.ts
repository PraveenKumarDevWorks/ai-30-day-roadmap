import { Controller, Get, Header } from '@nestjs/common'
import { homeHtml } from './home.html'

@Controller()
export class AppController {
  @Get()
  @Header('Content-Type', 'text/html')
  home() {
    return homeHtml
  }
}
