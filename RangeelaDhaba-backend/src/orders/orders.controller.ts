import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser, JwtUserPayload } from '../common/decorators/current-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: JwtUserPayload, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  myOrders(@CurrentUser() user: JwtUserPayload) {
    return this.ordersService.findUserOrders(user.userId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin')
  adminAll() {
    return this.ordersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@CurrentUser() user: JwtUserPayload, @Param('id') id: string) {
    return this.ordersService.findOne(id, user.userId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('reason') reason?: string,
  ) {
    return this.ordersService.updateStatus(id, status, reason);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  cancelOrder(@CurrentUser() user: JwtUserPayload, @Param('id') id: string) {
    return this.ordersService.cancelOrder(id, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/can-cancel')
  canCancelOrder(@CurrentUser() user: JwtUserPayload, @Param('id') id: string) {
    return this.ordersService.canCancelOrder(id, user.userId);
  }
}


