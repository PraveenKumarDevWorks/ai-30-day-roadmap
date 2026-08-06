// Enables the pgvector extension on the target database. This has to run
// once, before `prisma db push` creates the `documents` table — Prisma
// itself doesn't know what a Postgres extension is, so it can never do
// this step for you.
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;')
  console.log('pgvector extension is enabled on this database.')
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
