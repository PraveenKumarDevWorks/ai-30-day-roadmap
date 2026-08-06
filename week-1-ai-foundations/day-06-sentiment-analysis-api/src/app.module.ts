import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { RedisModule } from './redis/redis.module'
import { SentimentModule } from './sentiment/sentiment.module'

@Module({
  imports: [RedisModule, SentimentModule],
  controllers: [AppController],
})
export class AppModule {}
