import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // whitelist: strip any request fields not declared on the DTO.
  // transform: turn plain JSON into real DTO class instances so
  // class-validator's decorators actually run against them.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  // Port 3001, not 3000 — so this can run alongside the Next.js projects
  // from earlier days without a port clash.
  await app.listen(3001)
  console.log('Day 4 API running on http://localhost:3001')
}
bootstrap()
