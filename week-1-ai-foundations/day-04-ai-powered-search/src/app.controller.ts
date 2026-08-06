import { Controller, Get, Res } from '@nestjs/common'
import type { Response } from 'express'
import { HOME_HTML } from './home.html'

@Controller()
export class AppController {
  @Get()
  home(@Res() res: Response) {
    res.type('html').send(HOME_HTML)
  }
}
