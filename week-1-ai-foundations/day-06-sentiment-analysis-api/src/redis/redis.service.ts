import { Injectable, OnModuleDestroy } from '@nestjs/common'
import Redis from 'ioredis'

// Unlike Prisma in Day 4 (which waits for an explicit $connect() call),
// ioredis starts connecting to the Redis server immediately when this
// object is constructed — no separate "connect" step to call ourselves.
// We still hook into Nest's shutdown lifecycle to close the connection
// cleanly when the app stops.
@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor() {
    super(process.env.REDIS_URL || 'redis://localhost:6379')
  }

  async onModuleDestroy() {
    await this.quit()
  }
}
