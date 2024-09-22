import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { BalanceModule } from './EoullimBalance/balance.module';
import { BalanceService } from './EoullimBalance/balance.service';
import { BalanceController } from './EoullimBalance/Balance.controller';
import { RepositoryModule } from './repository/repository.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    BalanceModule,
    RepositoryModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [BalanceController],
  providers: [BalanceService],
})
export class AppModule {}
