import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  // Port 3002 — Day 4's API used 3001, so this can run alongside it (and
  // the Next.js days on 3000) without a port clash.
  await app.listen(3002)
  console.log('Day 6 API running on http://localhost:3002')
}
bootstrap()
