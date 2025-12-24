import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private razorpayKeyId: string;
  private razorpayKeySecret: string;

  constructor(private configService: ConfigService) {
    this.razorpayKeyId = this.configService.get<string>('RAZORPAY_KEY_ID') || '';
    this.razorpayKeySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || '';
  }

  async createOrder(amount: number, currency: string = 'INR', orderId: string) {
    // In production, use Razorpay SDK
    // For now, return mock payment order
    return {
      id: `order_${Date.now()}`,
      amount: amount * 100, // Razorpay uses paise
      currency,
      receipt: orderId,
      status: 'created',
    };
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string) {
    // In production, verify Razorpay signature
    // For now, return mock verification
    return {
      verified: true,
      paymentId,
      orderId,
    };
  }

  getRazorpayKeyId() {
    return this.razorpayKeyId;
  }
}






