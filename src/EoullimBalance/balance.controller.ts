import { Controller, Post, Body } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { ExchangeRequest } from './dto/balance.dto';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Post('/exchange')
  async exchange(@Body() ExchangeDto: ExchangeRequest) {
    return this.balanceService.EoullimExchange(ExchangeDto);
  }
}
