import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { PrismaModule } from './prisma/prisma.module'
import { IngestionModule } from './ingestion/ingestion.module'

@Module({
  imports: [PrismaModule, IngestionModule],
  controllers: [AppController],
})
export class AppModule {}
