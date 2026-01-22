import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { DishesService } from '../dishes/dishes.service';
import { CartService } from '../cart/cart.service';
import { SettingsService } from '../settings/settings.service';
import { CouponsService } from '../coupons/coupons.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailerService, OrderEmailData } from '../mailer/mailer.service';
import { UsersService } from '../users/users.service';
import { distanceInKm } from '../common/utils/haversine';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private dishesService: DishesService,
    private cartService: CartService,
    private settingsService: SettingsService,
    private couponsService: CouponsService,
    private notificationsService: NotificationsService,
    private mailerService: MailerService,
    private usersService: UsersService,
  ) {}

  /**
   * Helper method to build order email data
   */
  private async buildOrderEmailData(order: OrderDocument, user: any): Promise<OrderEmailData> {
    return {
      orderId: order._id.toString(),
      customerName: user.name || 'Customer',
      customerEmail: user.email,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        isFree: item.isFree,
        isHalfPortion: item.isHalfPortion,
        isBuyOneGetOne: item.isBuyOneGetOne,
      })),
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      couponCode: order.couponCode,
      totalAmount: order.totalAmount,
      orderType: order.orderType,
      address: order.address,
      createdAt: (order as any).createdAt,
      specialInstructions: (order as any).specialInstructions,
    };
  }

  async create(userId: string, dto: CreateOrderDto) {
    const settings = await this.settingsService.getSettings();
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if restaurant is open
    const { isOpen, openingTime, closingTime, isManuallyClosed, closureReason } = await this.settingsService.isRestaurantOpen();
    if (!isOpen) {
      if (isManuallyClosed) {
        const reason = closureReason ? ` Reason: ${closureReason}` : '';
        throw new BadRequestException(
          `Sorry, we are temporarily closed.${reason} Please check back later.`
        );
      }
      throw new BadRequestException(
        `Sorry, we are currently closed. Our operating hours are ${openingTime} to ${closingTime}. Please try again during business hours.`
      );
    }

    const sourceItems = dto.items && dto.items.length ? dto.items : (await this.cartService.getCart(userId)).cartItems;
    if (!sourceItems || sourceItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }
    const items: Array<{ dish: Types.ObjectId; name: string; price: number; quantity: number; isFree?: boolean; isHalfPortion?: boolean; isBuyOneGetOne?: boolean }> = await Promise.all(
      sourceItems.map(async (i: any) => {
        const dishId = i.dishId || i.dish?._id || i.dish;
        const qty = i.quantity;
        const isHalfPortion = i.isHalfPortion || false;
        const dish = await this.dishesService.findOne(dishId);
        if (!dish) throw new NotFoundException('Dish not found');
        if (!dish.inStock) throw new BadRequestException('Dish is out of stock');

        // Use half portion price if applicable
        const price = isHalfPortion && dish.hasHalfPortion && dish.halfPortionPrice
          ? dish.halfPortionPrice
          : dish.price;

        return {
          dish: dish._id,
          name: dish.name,
          price,
          quantity: qty,
          isHalfPortion,
          isBuyOneGetOne: dish.isBuyOneGetOne || false,
        };
      }),
    );

    // Calculate subtotal with BOGO pricing
    let subtotal = items.reduce((sum, item) => {
      if (item.isBuyOneGetOne && item.quantity > 0) {
        // For BOGO: charge for half the quantity (rounded up)
        const chargeableQuantity = Math.ceil(item.quantity / 2);
        return sum + item.price * chargeableQuantity;
      }
      return sum + item.price * item.quantity;
    }, 0);

    // Check minimum order value
    const minOrderValue = settings.minOrderValue || 0;
    if (minOrderValue > 0 && subtotal < minOrderValue) {
      throw new BadRequestException(
        `Minimum order value is ₹${minOrderValue}. Please add ₹${(minOrderValue - subtotal).toFixed(2)} more to place your order.`
      );
    }

    let discountAmount = 0;
    let couponCode = null;

    // Apply coupon if provided
    if (dto.couponCode) {
      try {
        // Normalize coupon code to uppercase
        const normalizedCouponCode = dto.couponCode.toUpperCase().trim();
        const couponResult = await this.couponsService.validate({
          code: normalizedCouponCode,
          subtotal,
        });
        if (couponResult.valid) {
          discountAmount = couponResult.discount;
          couponCode = normalizedCouponCode;

          // Add free items to order if coupon has any
          if (couponResult.freeItems && couponResult.freeItems.length > 0) {
            for (const freeItem of couponResult.freeItems) {
              items.push({
                dish: freeItem.dish._id,
                name: freeItem.dish.name,
                price: 0,
                quantity: freeItem.quantity,
                isFree: true,
              });
            }
          }

          // Increment usage count when coupon is applied
          await this.couponsService.applyCoupon(normalizedCouponCode);
        }
      } catch (error: any) {
        // Coupon validation failed - throw error so frontend can show message
        throw new BadRequestException(error.message || 'Invalid coupon code');
      }
    }

    const totalAmount = subtotal - discountAmount;

    // Distance check and delivery availability
    const lat = dto.address.lat ?? settings.lat;
    const lng = dto.address.lng ?? settings.lng;
    const distance = distanceInKm(settings.lat, settings.lng, lat, lng);

    // Determine order type based on distance and delivery availability
    let orderType: 'delivery' | 'takeaway';
    if (!settings.isDeliveryEnabled) {
      // If delivery is disabled, force takeaway
      orderType = 'takeaway';
    } else {
      // Normal distance-based logic
      orderType = distance <= 2 ? 'delivery' : 'takeaway';
    }

    const order = await this.orderModel.create({
      user: userId,
      items,
      subtotal,
      discountAmount,
      couponCode,
      totalAmount,
      orderType,
      address: dto.address,
      status: 'placed',
      specialInstructions: dto.specialInstructions,
    });
    await this.cartService.clear(userId);

    // Create notification for user
    await this.notificationsService.notifyOrderStatus(userId, order._id.toString(), 'placed');

    // Notify all admins about new order
    await this.notificationsService.notifyAdminsNewOrder(order._id.toString(), order.totalAmount, user.name);

    // Send order confirmation email
    try {
      const emailData = await this.buildOrderEmailData(order, user);
      await this.mailerService.sendOrderPlaced(emailData);
    } catch (error) {
      // Log error but don't fail the order
      console.error('Failed to send order confirmation email:', error);
    }

    return order;
  }

  findUserOrders(userId: string) {
    return this.orderModel.find({ user: userId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, userId: string) {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid order ID format');
    }
    const order = await this.orderModel.findOne({ _id: id, user: userId }).populate('user', 'name email');
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  findAll() {
    return this.orderModel.find().populate('user').sort({ createdAt: -1 }).exec();
  }

  async updateStatus(id: string, status: string, reason?: string) {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid order ID format');
    }

    // Validate status
    const validStatuses = ['placed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await this.orderModel.findByIdAndUpdate(id, { status }, { new: true }).populate('user', 'name email');
    if (!order) throw new NotFoundException('Order not found');

    const user = order.user as any;

    // Notify user of status change
    await this.notificationsService.notifyOrderStatus(
      user._id.toString(),
      id,
      status,
    );

    // Send appropriate email based on status
    try {
      const emailData = await this.buildOrderEmailData(order, user);

      switch (status) {
        case 'preparing':
          await this.mailerService.sendOrderPreparing(emailData);
          break;
        case 'ready_for_pickup':
          await this.mailerService.sendOrderReadyForPickup(emailData);
          break;
        case 'out_for_delivery':
          await this.mailerService.sendOrderOutForDelivery(emailData);
          break;
        case 'delivered':
          await this.mailerService.sendOrderDelivered(emailData);
          break;
        case 'cancelled':
          await this.mailerService.sendOrderCancelled(emailData, reason);
          break;
      }
    } catch (error) {
      // Log error but don't fail the status update
      console.error(`Failed to send ${status} email:`, error);
    }

    return order;
  }

  /**
   * Cancel order - only allowed within 2 minutes of placing
   */
  async cancelOrder(orderId: string, userId: string) {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Invalid order ID format');
    }

    const order = await this.orderModel.findOne({ _id: orderId, user: userId }).populate('user', 'name email');
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if order is already cancelled or delivered
    if (order.status === 'cancelled') {
      throw new BadRequestException('Order is already cancelled');
    }

    if (order.status === 'delivered') {
      throw new BadRequestException('Cannot cancel a delivered order');
    }

    // Check if order is still within cancellation window (2 minutes)
    const orderTime = new Date((order as any).createdAt).getTime();
    const now = Date.now();
    const twoMinutesInMs = 2 * 60 * 1000;
    const timeElapsed = now - orderTime;

    if (timeElapsed > twoMinutesInMs) {
      throw new BadRequestException(
        'Cancellation window has expired. Orders can only be cancelled within 2 minutes of placing.'
      );
    }

    // Only allow cancellation if status is 'placed' or 'preparing'
    if (!['placed', 'preparing'].includes(order.status)) {
      throw new BadRequestException(
        `Cannot cancel order with status "${order.status}". Please contact support.`
      );
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    await order.save();

    const user = order.user as any;

    // Notify user
    await this.notificationsService.notifyOrderStatus(
      user._id.toString(),
      orderId,
      'cancelled',
    );

    // Send cancellation email
    try {
      const emailData = await this.buildOrderEmailData(order, user);
      await this.mailerService.sendOrderCancelled(emailData, 'Cancelled by customer');
    } catch (error) {
      console.error('Failed to send cancellation email:', error);
    }

    return {
      success: true,
      message: 'Order cancelled successfully',
      order,
    };
  }

  /**
   * Check if order can be cancelled (within 2 min window)
   */
  async canCancelOrder(orderId: string, userId: string) {
    if (!Types.ObjectId.isValid(orderId)) {
      return { canCancel: false, reason: 'Invalid order ID', timeRemaining: 0 };
    }

    const order = await this.orderModel.findOne({ _id: orderId, user: userId });
    if (!order) {
      return { canCancel: false, reason: 'Order not found', timeRemaining: 0 };
    }

    if (order.status === 'cancelled') {
      return { canCancel: false, reason: 'Order already cancelled', timeRemaining: 0 };
    }

    if (order.status === 'delivered') {
      return { canCancel: false, reason: 'Order already delivered', timeRemaining: 0 };
    }

    if (!['placed', 'preparing'].includes(order.status)) {
      return { canCancel: false, reason: `Order is ${order.status}`, timeRemaining: 0 };
    }

    const orderTime = new Date((order as any).createdAt).getTime();
    const now = Date.now();
    const twoMinutesInMs = 2 * 60 * 1000;
    const timeRemaining = Math.max(0, twoMinutesInMs - (now - orderTime));

    if (timeRemaining <= 0) {
      return { canCancel: false, reason: 'Cancellation window expired', timeRemaining: 0 };
    }

    return { canCancel: true, reason: null, timeRemaining };
  }

  async summary() {
    const totalOrders = await this.orderModel.countDocuments();
    const totalRevenueAgg = await this.orderModel.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    return { totalOrders, totalRevenue };
  }

  async statusBreakdown() {
    const result = await this.orderModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    return result.map((r) => ({ status: r._id, count: r.count }));
  }

  async revenueByMonth() {
    return this.orderModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async bestSellers(limit = 5) {
    return this.orderModel.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          orders: { $sum: 1 },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          quantity: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
    ]);
  }
}
