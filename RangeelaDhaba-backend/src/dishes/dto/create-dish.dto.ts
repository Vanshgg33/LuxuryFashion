import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { DishCategory } from '../enums/dish-category.enum';
import { FoodCategory } from '../enums/food-category.enum';

export class CreateDishDto {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(FoodCategory)
  foodCategory?: FoodCategory;

  @IsOptional()
  @IsEnum(DishCategory)
  dishCategory?: DishCategory;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  inStock?: boolean;
}


