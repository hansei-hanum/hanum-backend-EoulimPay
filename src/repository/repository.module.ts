// balance.module.ts
import { Module } from '@nestjs/common';

import { BalanceRepository } from '../repository/BalanceRepository';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [BalanceRepository, PrismaService],
  exports: [BalanceRepository],
})
export class RepositoryModule {}
