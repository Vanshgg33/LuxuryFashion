import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  dishId: string;

  @IsNumber()
  quantity: number;
}

export class AddressDto {
  @IsString()
  street: string;
  @IsString()
  city: string;
  @IsString()
  state: string;
  @IsString()
  zipCode: string;
  @IsString()
  country: string;
  @IsOptional()
  @IsString()
  phoneNumber?: string;
  @IsOptional()
  @IsNumber()
  lat?: number;
  @IsOptional()
  @IsNumber()
  lng?: number;
}

export class CreateOrderDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsEnum(['delivery', 'takeaway'])
  orderType: 'delivery' | 'takeaway';

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

