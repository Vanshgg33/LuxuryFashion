import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {
  welcomeEmailTemplate,
  otpEmailTemplate,
  orderPlacedEmailTemplate,
  orderPreparingEmailTemplate,
  orderReadyForPickupEmailTemplate,
  orderOutForDeliveryEmailTemplate,
  orderDeliveredEmailTemplate,
  orderCancelledEmailTemplate,
} from './email-templates';

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    isFree?: boolean;
  }>;
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  totalAmount: number;
  orderType: 'delivery' | 'takeaway';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phoneNumber?: string;
  };
  createdAt?: Date;
  specialInstructions?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  /**
   * Send Welcome Email when user registers
   */
  async sendWelcome(email: string, name: string) {
    const html = welcomeEmailTemplate(name);
    await this.sendMail(
      email,
      'Welcome to RangeelaDhaba! 🎉',
      `Hi ${name}, welcome to RangeelaDhaba!`,
      html,
    );
    this.logger.log(`Welcome email sent to ${email}`);
  }

  /**
   * Send OTP Email for password reset
   */
  async sendOtp(email: string, otp: string, name: string = 'User') {
    const html = otpEmailTemplate(name, otp);
    await this.sendMail(
      email,
      'Reset Your RangeelaDhaba Password 🔐',
      `Your OTP for password reset is: ${otp}. This code expires in 10 minutes.`,
      html,
    );
    this.logger.log(`OTP email sent to ${email}`);
  }

  /**
   * Send Order Placed Confirmation Email
   */
  async sendOrderPlaced(orderData: OrderEmailData) {
    const html = orderPlacedEmailTemplate(orderData);
    await this.sendMail(
      orderData.customerEmail,
      `Order Confirmed! 🎊 #${orderData.orderId.slice(-8).toUpperCase()}`,
      `Thank you for your order! Your order #${orderData.orderId.slice(-8).toUpperCase()} has been confirmed. Total: ₹${orderData.totalAmount.toFixed(2)}`,
      html,
    );
    this.logger.log(`Order placed email sent to ${orderData.customerEmail}`);
  }

  /**
   * Send Order Preparing Email
   */
  async sendOrderPreparing(orderData: OrderEmailData) {
    const html = orderPreparingEmailTemplate(orderData);
    await this.sendMail(
      orderData.customerEmail,
      `Your Food is Being Prepared! 👨‍🍳 #${orderData.orderId.slice(-8).toUpperCase()}`,
      `Great news! Our chefs are now preparing your order #${orderData.orderId.slice(-8).toUpperCase()}.`,
      html,
    );
    this.logger.log(`Order preparing email sent to ${orderData.customerEmail}`);
  }

  /**
   * Send Order Ready for Pickup Email
   */
  async sendOrderReadyForPickup(orderData: OrderEmailData) {
    const html = orderReadyForPickupEmailTemplate(orderData);
    await this.sendMail(
      orderData.customerEmail,
      `Your Order is Ready for Pickup! 🏪 #${orderData.orderId.slice(-8).toUpperCase()}`,
      `Your order #${orderData.orderId.slice(-8).toUpperCase()} is ready! Please pick it up at our counter.`,
      html,
    );
    this.logger.log(`Order ready for pickup email sent to ${orderData.customerEmail}`);
  }

  /**
   * Send Order Out for Delivery Email
   */
  async sendOrderOutForDelivery(orderData: OrderEmailData) {
    const html = orderOutForDeliveryEmailTemplate(orderData);
    await this.sendMail(
      orderData.customerEmail,
      `Your Order is On Its Way! 🚴 #${orderData.orderId.slice(-8).toUpperCase()}`,
      `Exciting news! Your order #${orderData.orderId.slice(-8).toUpperCase()} is out for delivery and will reach you soon!`,
      html,
    );
    this.logger.log(`Order out for delivery email sent to ${orderData.customerEmail}`);
  }

  /**
   * Send Order Delivered Email
   */
  async sendOrderDelivered(orderData: OrderEmailData) {
    const html = orderDeliveredEmailTemplate(orderData);
    await this.sendMail(
      orderData.customerEmail,
      `Order Delivered! Enjoy Your Meal! 🎊 #${orderData.orderId.slice(-8).toUpperCase()}`,
      `Your order #${orderData.orderId.slice(-8).toUpperCase()} has been delivered. Enjoy your meal!`,
      html,
    );
    this.logger.log(`Order delivered email sent to ${orderData.customerEmail}`);
  }

  /**
   * Send Order Cancelled Email
   */
  async sendOrderCancelled(orderData: OrderEmailData, reason?: string) {
    const html = orderCancelledEmailTemplate(orderData, reason);
    await this.sendMail(
      orderData.customerEmail,
      `Order Cancelled 😔 #${orderData.orderId.slice(-8).toUpperCase()}`,
      `We're sorry, your order #${orderData.orderId.slice(-8).toUpperCase()} has been cancelled. ${reason ? `Reason: ${reason}` : ''}`,
      html,
    );
    this.logger.log(`Order cancelled email sent to ${orderData.customerEmail}`);
  }

  /**
   * Core email sending method with HTML support
   */
  async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: process.env.EMAIL_FROM || 'RangeelaDhaba <no-reply@rangeeladhaba.com>',
        to,
        subject,
        text,
      };

      if (html) {
        mailOptions.html = html;
      }

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}: ${subject}`);
    } catch (err) {
      this.logger.error(`Email send failed to ${to}`, err as any);
    }
  }
}
