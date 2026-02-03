import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtUserPayload } from '../common/decorators/current-user.decorator';
import { AddCartItemDto, UpdateCartItemDto, AddFreeItemsDto, RemoveFreeItemsDto } from './dto/cart.dto';

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
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addItem(user.userId, dto.dishId, dto.quantity || 1, dto.isHalfPortion || false);
  }

  @Patch('items/:itemId')
  update(
    @CurrentUser() user: JwtUserPayload,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.userId, itemId, dto.quantity);
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
    @Body() dto: AddFreeItemsDto
  ) {
    return this.cartService.addFreeItems(user.userId, dto.freeItems, dto.couponCode);
  }

  @Delete('free-items')
  removeFreeItems(
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: RemoveFreeItemsDto
  ) {
    return this.cartService.removeFreeItems(user.userId, dto.couponCode);
  }
}


