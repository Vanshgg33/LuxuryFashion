import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Dish, DishDocument } from './schemas/dish.schema';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@Injectable()
export class DishesService {
  constructor(@InjectModel(Dish.name) private dishModel: Model<DishDocument>) {}

  /**
   * Get current time in IST
   */
  private getCurrentTimeIST(): string {
    // Use Intl.DateTimeFormat for accurate IST conversion
    const now = new Date();
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const hours = istTime.getHours().toString().padStart(2, '0');
    const minutes = istTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Check if current time is within the specified time range
   */
  isTimeInRange(from: string, to: string): boolean {
    const current = this.getCurrentTimeIST();
    const [currHour, currMin] = current.split(':').map(Number);
    const [fromHour, fromMin] = from.split(':').map(Number);
    const [toHour, toMin] = to.split(':').map(Number);

    const currentMinutes = currHour * 60 + currMin;
    const fromMinutes = fromHour * 60 + fromMin;
    const toMinutes = toHour * 60 + toMin;

    if (toMinutes > fromMinutes) {
      // Normal case: e.g., 09:00 to 14:00
      return currentMinutes >= fromMinutes && currentMinutes < toMinutes;
    } else {
      // Overnight case: e.g., 22:00 to 06:00
      return currentMinutes >= fromMinutes || currentMinutes < toMinutes;
    }
  }

  /**
   * Check if a dish is currently available based on time restrictions
   */
  isDishAvailableNow(dish: any, categoryRestrictions?: Record<string, { availableFrom: string; availableTo: string; isEnabled: boolean }>): {
    isAvailable: boolean;
    reason?: string;
    availableFrom?: string;
    availableTo?: string;
  } {
    // Check dish-level time restriction first
    if (dish.hasTimeRestriction && dish.availableFrom && dish.availableTo) {
      const isInRange = this.isTimeInRange(dish.availableFrom, dish.availableTo);
      if (!isInRange) {
        return {
          isAvailable: false,
          reason: `Available from ${dish.availableFrom} to ${dish.availableTo}`,
          availableFrom: dish.availableFrom,
          availableTo: dish.availableTo,
        };
      }
    }

    // Check category-level time restriction
    if (categoryRestrictions && dish.dishCategory) {
      const categoryRestriction = categoryRestrictions[dish.dishCategory];
      if (categoryRestriction?.isEnabled && categoryRestriction.availableFrom && categoryRestriction.availableTo) {
        const isInRange = this.isTimeInRange(categoryRestriction.availableFrom, categoryRestriction.availableTo);
        if (!isInRange) {
          return {
            isAvailable: false,
            reason: `${dish.dishCategory} available from ${categoryRestriction.availableFrom} to ${categoryRestriction.availableTo}`,
            availableFrom: categoryRestriction.availableFrom,
            availableTo: categoryRestriction.availableTo,
          };
        }
      }
    }

    return { isAvailable: true };
  }

  create(dto: CreateDishDto) {
    return new this.dishModel(dto).save();
  }

  findAll(filter: any = {}) {
    return this.dishModel.find(filter).exec();
  }

  findOne(id: string) {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.dishModel.findById(id).exec();
  }

  async update(id: string, dto: UpdateDishDto) {
    const dish = await this.dishModel.findByIdAndUpdate(id, dto, { new: true });
    if (!dish) throw new NotFoundException('Dish not found');
    return dish;
  }

  async remove(id: string) {
    const dish = await this.dishModel.findByIdAndDelete(id);
    if (!dish) throw new NotFoundException('Dish not found');
    return { deleted: true };
  }

  /**
   * Update stock status for all dishes in a category
   */
  async updateCategoryStock(category: string, inStock: boolean) {
    const result = await this.dishModel.updateMany(
      { dishCategory: category },
      { inStock }
    );
    return {
      updated: result.modifiedCount,
      category,
      inStock
    };
  }

  /**
   * Get stock status by category
   */
  async getCategoryStockStatus() {
    const dishes = await this.dishModel.find().exec();
    const categoryStatus: Record<string, { total: number; inStock: number; outOfStock: number }> = {};

    dishes.forEach((dish: any) => {
      const category = dish.dishCategory || 'Uncategorized';
      if (!categoryStatus[category]) {
        categoryStatus[category] = { total: 0, inStock: 0, outOfStock: 0 };
      }
      categoryStatus[category].total++;
      if (dish.inStock) {
        categoryStatus[category].inStock++;
      } else {
        categoryStatus[category].outOfStock++;
      }
    });

    return categoryStatus;
  }
}


