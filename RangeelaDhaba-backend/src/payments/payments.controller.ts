import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-order')
  createOrder(@CurrentUser() user: any, @Body() body: { amount: number; orderId: string }) {
    return this.paymentsService.createOrder(body.amount, 'INR', body.orderId);
  }

  @Post('verify')
  verifyPayment(@Body() body: { paymentId: string; orderId: string; signature: string }) {
    return this.paymentsService.verifyPayment(body.paymentId, body.orderId, body.signature);
  }

  @Post('key')
  getKey() {
    return { keyId: this.paymentsService.getRazorpayKeyId() };
  }
}






