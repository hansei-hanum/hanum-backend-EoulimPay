import { Controller, Post, Body } from '@nestjs/common';
import { BalanceService } from './balance.service';
import {
  ExchangeRequest,
  RefundRequest,
  PaymentRequest,
} from './dto/balance.dto';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Post('/exchange')
  async exchange(@Body() ExchangeDto: ExchangeRequest) {
    return this.balanceService.EoullimExchange(ExchangeDto);
  }

  @Post('/payment')
  async payment(@Body() PaymentDto: PaymentRequest) {
    return this.balanceService.EoullimPayment(PaymentDto);
  }

  @Post('/refund')
  async refund(@Body() RefundDto: RefundRequest) {
    return this.balanceService.EoullimRefund(RefundDto);
  }
}
