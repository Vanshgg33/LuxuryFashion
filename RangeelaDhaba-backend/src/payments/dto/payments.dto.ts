import { IsString, IsNumber, Min } from 'class-validator';

export class CreatePaymentOrderDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  orderId: string;
}

export class VerifyPaymentDto {
  @IsString()
  paymentId: string;

  @IsString()
  orderId: string;

  @IsString()
  signature: string;
}
