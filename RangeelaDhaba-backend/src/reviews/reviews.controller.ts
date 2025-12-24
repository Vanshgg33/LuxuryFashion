import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get('dish/:dishId')
  findByDish(@Param('dishId') dishId: string) {
    return this.reviewsService.findByDish(dishId);
  }

  @Get('dish/:dishId/rating')
  getDishRating(@Param('dishId') dishId: string) {
    return this.reviewsService.getDishRating(dishId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('dish/:dishId')
  create(@CurrentUser() user: any, @Param('dishId') dishId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.userId, dishId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('dish/:dishId')
  update(@CurrentUser() user: any, @Param('dishId') dishId: string, @Body() dto: Partial<CreateReviewDto>) {
    return this.reviewsService.update(user.userId, dishId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('dish/:dishId')
  delete(@CurrentUser() user: any, @Param('dishId') dishId: string) {
    return this.reviewsService.delete(user.userId, dishId);
  }
}






