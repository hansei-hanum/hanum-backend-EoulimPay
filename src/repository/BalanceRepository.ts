import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BalanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async ExchangeTransfer(
    receiverId: bigint,
    comment: string,
    amount: number,
  ) {
    await this.EoullimTransaction(
      null, // senderBalanceId
      receiverId, // receiverBalanceId
      amount, // amount
      comment, // message
    );

    return {
      amount: amount,
      comment: comment,
    };
  }

  public async EnsurePersonalBalance(userId: number) {
    const userBalance = await this.prisma.eoullimBalances.findFirst({
      where: {
        userId: userId,
      },
      select: {
        amount: true,
        id: true,
      },
    });

    if (!userBalance) {
      const newUserBalance = await this.prisma.eoullimBalances.create({
        data: {
          userId: userId,
          amount: 0,
        },
      });
      return {
        balanceId: newUserBalance.id,
        amount: newUserBalance.amount,
      };
    }

    return {
      balanceId: userBalance.id,
      amount: userBalance.amount,
    };
  }

  private async EoullimTransaction(
    senderId: bigint,
    receiverId: bigint,
    amount: number,
    message: string,
  ) {
    if (senderId == receiverId) {
      throw new BadRequestException('SENDER_ID_EQUALS_RECEVER_ID');
    }

    if (amount <= 0) {
      throw new BadRequestException('INVALID_TRANSFER_AMOUNT');
    }

    let decrementedSenderBalance: any = null;

    if (senderId !== null) {
      let senderBalance: any;
      [senderBalance] = await this.prisma
        .$queryRaw`SELECT * FROM EoullimBalances WHERE id = ${senderId} FOR UPDATE`;

      if (senderBalance.amount <= 0 || senderBalance.amount < amount) {
        throw new BadRequestException('NOT_ENOUGH_BALANCE');
      }

      decrementedSenderBalance = await this.prisma.eoullimBalances.update({
        where: {
          id: senderId,
        },
        data: {
          amount: { decrement: amount },
        },
      });
    }

    let receiverBalance: any;
    [receiverBalance] = await this.prisma
      .$queryRaw`SELECT * FROM EoullimBalances WHERE id = ${receiverId} FOR UPDATE`;

    if (!receiverBalance) {
      throw new BadRequestException('RECEIVER_BALANCE_NOT_FOUND');
    }

    const incrementedReceiverBalance = await this.prisma.eoullimBalances.update(
      {
        where: {
          id: receiverId,
        },
        data: {
          amount: { increment: amount },
        },
      },
    );

    const transaction = await this.prisma.eoullimTransactions.create({
      data: {
        senderId: senderId,
        receiverId: receiverId,
        amount: amount,
        comment: message,
      },
    });
    return {
      transactionId: transaction.id,
      transactionTime: transaction.time,
      senderAmount: senderId !== null ? decrementedSenderBalance.amount : null,
      receiverAmount: incrementedReceiverBalance.amount,
    };
  }
}
