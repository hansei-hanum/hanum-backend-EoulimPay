import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceController } from './Balance.controller';
import { BalanceRepository } from 'src/repository/BalanceRepository';

@Module({
  controllers: [BalanceController],
  providers: [BalanceService, BalanceRepository],
})
export class BalanceModule {}
