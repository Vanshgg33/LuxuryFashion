import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(Review.name) private reviewModel: Model<ReviewDocument>) {}

  async create(userId: string, dishId: string, dto: CreateReviewDto) {
    try {
      const review = await this.reviewModel.create({
        user: userId,
        dish: dishId,
        ...dto,
      });
      return review.populate('user', 'name email');
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException('You have already reviewed this dish');
      }
      throw error;
    }
  }

  async update(userId: string, dishId: string, dto: Partial<CreateReviewDto>) {
    const review = await this.reviewModel.findOneAndUpdate(
      { user: userId, dish: dishId },
      dto,
      { new: true },
    ).populate('user', 'name email');
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async delete(userId: string, dishId: string) {
    const review = await this.reviewModel.findOneAndDelete({ user: userId, dish: dishId });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async findByDish(dishId: string) {
    return this.reviewModel
      .find({ dish: dishId, isVisible: true })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getDishRating(dishId: string) {
    const result = await this.reviewModel.aggregate([
      { $match: { dish: dishId, isVisible: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);
    return result[0] || { averageRating: 0, totalReviews: 0 };
  }
}






