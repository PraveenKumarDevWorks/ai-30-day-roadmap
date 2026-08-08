import { PrismaClient } from '@prisma/client'

process.loadEnvFile()

async function main() {
  const prisma = new PrismaClient()
  try {
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;')
    console.log('pgvector extension enabled.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('Failed to enable pgvector extension:', err)
  process.exit(1)
})
