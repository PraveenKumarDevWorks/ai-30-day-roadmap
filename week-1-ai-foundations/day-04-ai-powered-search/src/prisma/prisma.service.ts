import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

// A thin wrapper so PrismaClient's connection lifecycle is tied to Nest's
// own module lifecycle — connect when the app starts, disconnect when it
// shuts down, instead of managing that by hand everywhere.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
