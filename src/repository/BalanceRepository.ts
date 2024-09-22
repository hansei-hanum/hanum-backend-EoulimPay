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

  public async EnsurePersonalBalance(userId: bigint) {
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

  public async EoullimTransaction(
    senderId: bigint | null,
    receiverId: bigint,
    amount: number,
    message: string,
  ) {
    if (senderId == receiverId) {
      throw new BadRequestException('SENDER_ID_EQUALS_RECEVER_ID');
    }

    if (amount <= 0 || !amount) {
      throw new BadRequestException('INVALID_TRANSFER_AMOUNT');
    }

    return await this.prisma.$transaction(async (prisma) => {
      let decrementedSenderBalance: any = null;
      let incrementedReceiverBalance: any;

      let senderBalance: any;
      let receiverBalance: any;

      if (senderId !== null) {
        [senderBalance] =
          await prisma.$queryRaw`SELECT * FROM EoullimBalances WHERE id = ${senderId} FOR UPDATE`;

        if (senderBalance.amount <= 0 || senderBalance.amount < amount) {
          throw new BadRequestException('NOT_ENOUGH_BALANCE');
        }

        decrementedSenderBalance = await prisma.eoullimBalances.update({
          where: {
            id: BigInt(senderId),
          },
          data: {
            amount: { decrement: amount },
          },
        });
      }

      [receiverBalance] =
        await prisma.$queryRaw`SELECT * FROM EoullimBalances WHERE id = ${receiverId} FOR UPDATE`;

      if (!receiverBalance) {
        throw new BadRequestException('RECEIVER_BALANCE_NOT_FOUND');
      }

      incrementedReceiverBalance = await prisma.eoullimBalances.update({
        where: {
          id: receiverId,
        },
        data: {
          amount: { increment: amount },
        },
      });

      const transaction = await prisma.eoullimTransactions.create({
        data: {
          senderId: senderId,
          receiverId: receiverId,
          amount: amount,
          comment: message,
          type: 'payment',
        },
      });
      return {
        transactionId: transaction.id,
        transactionTime: transaction.time,
        sender: {
          senderId: senderId,
          senderBalanceId: senderBalance,
        },
        receiver: {
          receiverId: receiverId,
          receiverBalanceId: receiverBalance,
        },
        paidAmount: amount,
      };
    });
  }

  public async getBoothBalanceId(boothToken: string) {
    const booth = await this.prisma.eoullimBooths.findFirst({
      where: {
        token: boothToken,
      },
      select: {
        id: true,
      },
    });

    if (!booth) {
      throw new BadRequestException('BOOTH_NOT_FOUND');
    }

    const boothBalance = await this.prisma.eoullimBalances.findFirst({
      where: {
        boothId: booth.id,
      },
      select: {
        id: true,
      },
    });

    if (!boothBalance) {
      throw new BadRequestException('BOOTH_BALANCE_NOT_FOUND');
    }

    return boothBalance.id;
  }

  public async CreatePaymentRecord(
    userId: bigint,
    boothId: bigint,
    userBalanceId: bigint,
    boothBalanceId: bigint,
    paidAmount: bigint,
    paymentTransactionId: bigint,
  ) {
    await this.prisma.eoullimPayments.create({
      data: {
        userId: userId,
        boothId: boothId,
        userBalanceId: userBalanceId,
        boothBalanceId: boothBalanceId,
        paidAmount: paidAmount,
        paymentsTransactionId: paymentTransactionId,
      },
    });

    return true;
  }

  public async EoullimPaymentRefund(
    paymentId: bigint,
    comment: string = 'NO_COMMENT_PROVIDED',
  ) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        if (!paymentId) {
          throw new BadRequestException('PAYMENT_ID_NOT_PROVIDED');
        }

        const payments = await prisma.eoullimPayments.findFirst({
          where: {
            id: paymentId,
          },
          select: {
            id: true,
            userBalanceId: true,
            boothBalanceId: true,
            paidAmount: true,
          },
        });

        if (!payments) {
          throw new BadRequestException('PAYMENT_NOT_FOUND');
        }

        if (payments.paidAmount <= 0) {
          throw new BadRequestException('INVALID_REFUND_AMOUNT');
        }

        const incrementedUserBalance = await prisma.eoullimBalances.update({
          where: {
            id: payments.userBalanceId,
          },
          data: {
            amount: { increment: payments.paidAmount },
          },
        });

        await prisma.eoullimBalances.update({
          where: {
            id: payments.boothBalanceId,
          },
          data: {
            amount: { decrement: payments.paidAmount },
          },
        });

        await prisma.eoullimPayments.update({
          where: {
            id: paymentId,
          },
          data: {
            status: 'refunded',
            refundComment: comment,
          },
        });

        return {
          message: 'success',
          data: {
            user: {
              amount: incrementedUserBalance.amount,
            },
          },
        };
      });
    } catch (e) {
      console.log(e.message);
      throw new BadRequestException('REFUND_FAILED');
    }
  }
}
