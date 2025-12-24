import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema';

@Injectable()
export class FavoritesService {
  constructor(@InjectModel(Favorite.name) private favoriteModel: Model<FavoriteDocument>) {}

  async add(userId: string, dishId: string) {
    try {
      const favorite = await this.favoriteModel.create({ user: userId, dish: dishId });
      return favorite;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException('Dish already in favorites');
      }
      throw error;
    }
  }

  async remove(userId: string, dishId: string) {
    return this.favoriteModel.findOneAndDelete({ user: userId, dish: dishId });
  }

  async findAll(userId: string) {
    return this.favoriteModel.find({ user: userId }).populate('dish').sort({ addedAt: -1 }).exec();
  }

  async isFavorite(userId: string, dishId: string) {
    const favorite = await this.favoriteModel.findOne({ user: userId, dish: dishId });
    return !!favorite;
  }
}






