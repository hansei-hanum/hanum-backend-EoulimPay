import { BadRequestException, Injectable } from '@nestjs/common';
import { BalanceRepository } from 'src/repository/BalanceRepository';
import {
  ExchangeRequest,
  PaymentRequest,
  RefundRequest,
} from './dto/balance.dto';

@Injectable()
export class BalanceService {
  constructor(private readonly repository: BalanceRepository) {}

  async EoullimExchange(data: ExchangeRequest) {
    const { userId, comment, amount } = data;

    const userBalance = await this.repository.EnsurePersonalBalance(
      BigInt(userId),
    );

    await this.repository.EoullimTransaction(
      null,
      userBalance.balanceId,
      amount,
      comment,
    );

    return {
      message: 'SUCCESS',
    };
  }

  async EoullimPayment(data: PaymentRequest) {
    const { boothToken, amount } = data;

    const boothId = await this.repository.getBoothBalanceId(boothToken);

    const paymentRes = await this.repository.EoullimTransaction(
      BigInt(2), // senderId
      boothId, // receiverId
      amount, // amount
      '정상 결제', // message
    );

    await this.repository.CreatePaymentRecord(
      BigInt(2), // dummy sender id
      boothId, // receiverId
      BigInt(paymentRes.sender.senderBalanceId.id),
      BigInt(paymentRes.receiver.receiverBalanceId.id),
      BigInt(amount),
      paymentRes.transactionId,
    );

    return {
      message: 'success',
    };
  }

  public async EoullimRefund(data: RefundRequest) {
    const { transactionId, comment = 'NO_COMMENT_PROVIDED' } = data;

    const refundRes = await this.repository.EoullimPaymentRefund(
      BigInt(transactionId),
      comment,
    );

    return {
      message: 'success',
      data: {
        updatedUserAmount: refundRes.data.user.amount.toString(),
      },
    };
  }
}
