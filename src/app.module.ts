import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { BalanceModule } from './EoullimBalance/balance.module';
import { BalanceService } from './EoullimBalance/balance.service';
import { BalanceController } from './EoullimBalance/Balance.controller';
import { RepositoryModule } from './repository/repository.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from '@nestjs/microservices';
import { grpcClientOptions } from './micro/grpcClientOptions';

@Module({
  imports: [
    PrismaModule,
    BalanceModule,
    RepositoryModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        ...grpcClientOptions,
      },
    ]),
  ],
  controllers: [BalanceController],
  providers: [BalanceService],
})
export class AppModule {}
