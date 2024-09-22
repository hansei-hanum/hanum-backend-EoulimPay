import { IsNumber, IsString } from 'class-validator';

export class ExchangeRequest {
  @IsNumber()
  userId: number;

  @IsString()
  comment: string;

  @IsNumber()
  amount: number;
}

export class PaymentRequest {
  @IsString()
  boothToken: string;

  @IsNumber()
  amount: number;
}
