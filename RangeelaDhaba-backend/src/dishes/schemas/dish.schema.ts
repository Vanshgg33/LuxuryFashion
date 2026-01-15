import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DishCategory } from '../enums/dish-category.enum';
import { FoodCategory } from '../enums/food-category.enum';

export type DishDocument = Dish & Document;

@Schema({ timestamps: true })
export class Dish {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  imageUrl?: string;

  @Prop()
  description?: string;

  @Prop({ 
    type: String,
    enum: Object.values(FoodCategory),
  })
  foodCategory?: FoodCategory;

  @Prop({ 
    type: String,
    enum: Object.values(DishCategory),
  })
  dishCategory?: DishCategory;

  @Prop({ default: true })
  inStock: boolean;

  @Prop()
  availableFrom?: string; // Time in HH:mm format (e.g., "09:00")

  @Prop()
  availableTo?: string; // Time in HH:mm format (e.g., "22:00")

  @Prop({ default: false })
  hasTimeRestriction: boolean;

  @Prop({ default: false })
  isBuyOneGetOne: boolean;
}

export const DishSchema = SchemaFactory.createForClass(Dish);


