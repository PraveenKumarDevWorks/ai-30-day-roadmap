import { Global, Module } from '@nestjs/common'
import { RedisService } from './redis.service'

// @Global() so any future day-6-style feature can inject RedisService
// without importing RedisModule into every module by hand — same pattern
// as PrismaModule in Day 4.
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
