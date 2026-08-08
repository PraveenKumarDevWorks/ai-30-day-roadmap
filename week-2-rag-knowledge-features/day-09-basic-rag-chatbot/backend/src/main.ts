import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

// Nest doesn't load .env on its own — without this, DATABASE_URL etc. are
// undefined at runtime and Prisma fails with P1012 even though .env exists.
try {
  process.loadEnvFile()
} catch {
  throw new Error(
    'Missing .env file in backend/. Run `cp .env.example .env` (and fill in real values) before starting the server.',
  )
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  // The frontend (Next.js, a different origin/port) needs CORS turned on to
  // call this API directly from the browser.
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'
  app.enableCors({ origin: corsOrigin.split(',').map((o) => o.trim()) })

  // Port 3004 — Day 4 used 3001, Day 6 used 3002, Day 8 used 3003.
  await app.listen(3004)
  console.log('Day 9 RAG API running on http://localhost:3004')
}
bootstrap()
