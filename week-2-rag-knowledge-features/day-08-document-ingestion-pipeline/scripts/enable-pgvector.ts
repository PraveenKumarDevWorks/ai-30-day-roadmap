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
