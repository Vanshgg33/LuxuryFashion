import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested, Min, Allow } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class AddCartItemDto {
  @Transform(({ value }) => String(value))
  @IsString()
  dishId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsBoolean()
  isHalfPortion?: boolean;
}

export class UpdateCartItemDto {
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class FreeItemDishDto {
  @IsString()
  _id: string;

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class FreeItemInputDto {
  @ValidateNested()
  @Type(() => FreeItemDishDto)
  dish: FreeItemDishDto;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class AddFreeItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FreeItemInputDto)
  freeItems: FreeItemInputDto[];

  @IsString()
  couponCode: string;
}

export class RemoveFreeItemsDto {
  @IsOptional()
  @IsString()
  couponCode?: string;
}
