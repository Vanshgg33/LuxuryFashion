import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CartService, FreeItemInput } from './cart.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtUserPayload } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  get(@CurrentUser() user: JwtUserPayload) {
    return this.cartService.getCart(user.userId);
  }

  @Post('items')
  add(
    @CurrentUser() user: JwtUserPayload,
    @Body() body: { dishId: string | number; quantity?: number; isHalfPortion?: boolean },
  ) {
    // Ensure dishId is a string (handle both string and number inputs)
    const dishId = typeof body.dishId === 'number' ? String(body.dishId) : body.dishId;
    return this.cartService.addItem(user.userId, dishId, body.quantity || 1, body.isHalfPortion || false);
  }

  @Patch('items/:itemId')
  update(
    @CurrentUser() user: JwtUserPayload,
    @Param('itemId') itemId: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateItem(user.userId, itemId, body.quantity);
  }

  @Delete('items/:itemId')
  remove(@CurrentUser() user: JwtUserPayload, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(user.userId, itemId);
  }

  @Delete()
  clear(@CurrentUser() user: JwtUserPayload) {
    return this.cartService.clear(user.userId);
  }

  @Post('free-items')
  addFreeItems(
    @CurrentUser() user: JwtUserPayload,
    @Body() body: { freeItems: FreeItemInput[]; couponCode: string }
  ) {
    return this.cartService.addFreeItems(user.userId, body.freeItems, body.couponCode);
  }

  @Delete('free-items')
  removeFreeItems(
    @CurrentUser() user: JwtUserPayload,
    @Body() body: { couponCode?: string }
  ) {
    return this.cartService.removeFreeItems(user.userId, body.couponCode);
  }
}


