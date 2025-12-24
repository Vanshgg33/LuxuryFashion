import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post(':dishId')
  add(@CurrentUser() user: any, @Param('dishId') dishId: string) {
    return this.favoritesService.add(user.userId, dishId);
  }

  @Delete(':dishId')
  remove(@CurrentUser() user: any, @Param('dishId') dishId: string) {
    return this.favoritesService.remove(user.userId, dishId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.favoritesService.findAll(user.userId);
  }

  @Get(':dishId/check')
  check(@CurrentUser() user: any, @Param('dishId') dishId: string) {
    return this.favoritesService.isFavorite(user.userId, dishId);
  }
}






