import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, DeleteResult } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private usersService: UsersService,
  ) {}

  async create(userId: string, message: string, type: string, metadata?: any, link?: string) {
    return this.notificationModel.create({
      user: userId,
      message,
      type,
      metadata,
      link,
    });
  }

  async findAll(userId: string, limit = 50) {
    return this.notificationModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findUnread(userId: string) {
    return this.notificationModel
      .find({ user: userId, read: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true },
    );
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany({ user: userId, read: false }, { read: true });
  }

  async getUnreadCount(userId: string) {
    return this.notificationModel.countDocuments({ user: userId, read: false });
  }

  async delete(userId: string, notificationId: string) {
    return this.notificationModel.findOneAndDelete({ _id: notificationId, user: userId });
  }

  async clearAll(userId: string): Promise<DeleteResult> {
    return this.notificationModel.deleteMany({ user: userId });
  }

  // Helper to create order notifications
  async notifyOrderStatus(userId: string, orderId: string, status: string) {
    const shortOrderId = orderId.slice(-8).toUpperCase();
    const messages: Record<string, string> = {
      placed: `Your order #${shortOrderId} has been placed successfully! 🎉`,
      preparing: `Your order #${shortOrderId} is being prepared by our chefs 👨‍🍳`,
      ready_for_pickup: `Your order #${shortOrderId} is ready for pickup! 🏪`,
      out_for_delivery: `Your order #${shortOrderId} is out for delivery 🚴`,
      delivered: `Your order #${shortOrderId} has been delivered! Enjoy your meal 🎊`,
      cancelled: `Your order #${shortOrderId} has been cancelled 😔`,
    };
    return this.create(
      userId,
      messages[status] || `Your order #${shortOrderId} status updated to ${status}`,
      'order',
      { orderId, status },
      `/orders/${orderId}`,
    );
  }

  // Notify all admins about new order
  async notifyAdminsNewOrder(orderId: string, totalAmount: number, customerName: string) {
    try {
      const admins = await this.usersService.findAllAdmins();
      const shortOrderId = orderId.slice(-8).toUpperCase();
      const message = `🔔 New Order #${shortOrderId} from ${customerName} - ₹${totalAmount.toLocaleString()}`;
      
      // Create notification for each admin
      const notifications = admins.map((admin) =>
        this.create(
          admin._id.toString(),
          message,
          'order',
          { orderId, totalAmount, customerName, isAdminNotification: true },
          `/admin/orders`,
        ),
      );

      await Promise.all(notifications);
    } catch (error) {
      console.error('Failed to notify admins about new order:', error);
      // Don't throw - this shouldn't fail the order creation
    }
  }
}






