import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser, JwtUserPayload } from '../common/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // Public endpoints
  @Get('dish/:dishId')
  findByDish(@Param('dishId') dishId: string) {
    return this.reviewsService.findByDish(dishId);
  }

  @Get('dish/:dishId/rating')
  getDishRating(@Param('dishId') dishId: string) {
    return this.reviewsService.getDishRating(dishId);
  }

  @Get('top')
  getTopReviews(@Query('limit') limit?: string) {
    return this.reviewsService.getTopReviews(limit ? parseInt(limit) : 6);
  }

  // User endpoints
  @UseGuards(JwtAuthGuard)
  @Post('dish/:dishId')
  create(@CurrentUser() user: JwtUserPayload, @Param('dishId') dishId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.userId, dishId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('dish/:dishId')
  update(@CurrentUser() user: JwtUserPayload, @Param('dishId') dishId: string, @Body() dto: Partial<CreateReviewDto>) {
    return this.reviewsService.update(user.userId, dishId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('dish/:dishId')
  delete(@CurrentUser() user: JwtUserPayload, @Param('dishId') dishId: string) {
    return this.reviewsService.delete(user.userId, dishId);
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  findAll() {
    return this.reviewsService.findAll();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/:reviewId/toggle-visibility')
  toggleVisibility(@Param('reviewId') reviewId: string) {
    return this.reviewsService.toggleVisibility(reviewId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/:reviewId')
  adminDelete(@Param('reviewId') reviewId: string) {
    return this.reviewsService.adminDelete(reviewId);
  }
}






