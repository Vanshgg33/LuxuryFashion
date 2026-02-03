import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtUserPayload } from '../common/decorators/current-user.decorator';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './dto/payments.dto';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-order')
  createOrder(@CurrentUser() _user: JwtUserPayload, @Body() dto: CreatePaymentOrderDto) {
    return this.paymentsService.createOrder(dto.amount, 'INR', dto.orderId);
  }

  @Post('verify')
  verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(dto.paymentId, dto.orderId, dto.signature);
  }

  @Post('key')
  getKey() {
    return { keyId: this.paymentsService.getRazorpayKeyId() };
  }
}






