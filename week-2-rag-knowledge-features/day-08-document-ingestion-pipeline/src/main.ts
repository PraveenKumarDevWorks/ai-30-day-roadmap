import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  // Port 3003 — Day 4 used 3001, Day 6 used 3002.
  await app.listen(3003)
  console.log('Day 8 API running on http://localhost:3003')
}
bootstrap()
