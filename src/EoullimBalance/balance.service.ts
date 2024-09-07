import { Injectable } from '@nestjs/common';
import { BalanceRepository } from 'src/repository/BalanceRepository';
import { ExchangeRequest } from './dto/balance.dto';

@Injectable()
export class BalanceService {
  constructor(private readonly repository: BalanceRepository) {}

  async EoullimExchange(data: ExchangeRequest) {
    const { userId, comment, amount } = data;

    const userBalance = await this.repository.EnsurePersonalBalance(userId);
    const exchangeRes = await this.repository.ExchangeTransfer(
      userBalance.balanceId,
      comment,
      amount,
    );

    return {
      message: 'success',
      data: {
        amount: exchangeRes.amount,
        comment: exchangeRes.comment,
      },
    };
  }
}
