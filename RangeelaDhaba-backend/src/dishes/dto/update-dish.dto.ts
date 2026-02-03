import { PartialType } from '@nestjs/mapped-types';
import { CreateDishDto } from './create-dish.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDishDto extends PartialType(CreateDishDto) {
  @IsOptional()
  @IsString()
  imageUrl?: string;
}


