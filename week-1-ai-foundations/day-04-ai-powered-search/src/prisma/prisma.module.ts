import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'

// @Global() means every other module in this app can inject PrismaService
// without each one separately importing PrismaModule.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
