import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { DishesService } from '../dishes/dishes.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private ordersService: OrdersService,
    private usersService: UsersService,
    private dishesService: DishesService,
  ) {}

  async summary() {
    const [ordersSummary, users, dishes] = await Promise.all([
      this.ordersService.summary(),
      this.usersService.listUsers(),
      this.dishesService.findAll(),
    ]);
    return {
      totalOrders: ordersSummary.totalOrders,
      totalRevenue: ordersSummary.totalRevenue,
      totalUsers: users.length,
      totalDishes: dishes.length,
    };
  }

  async statusBreakdown() {
    return this.ordersService.statusBreakdown();
  }

  async revenueByMonth() {
    return this.ordersService.revenueByMonth();
  }

  async bestSellers(limit = 5) {
    return this.ordersService.bestSellers(limit);
  }
}


