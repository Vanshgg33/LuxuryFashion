import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Dish, DishDocument } from './schemas/dish.schema';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@Injectable()
export class DishesService {
  constructor(@InjectModel(Dish.name) private dishModel: Model<DishDocument>) {}

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
}


