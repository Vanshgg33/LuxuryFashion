import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, Matches } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Phone number sanitization - removes spaces, dashes, country code prefix, and leading zeros
const sanitizePhoneNumber = (value: string): string => {
  if (!value) return value;
  // Remove all non-digit characters except leading +
  let sanitized = value.replace(/[^\d+]/g, '');
  // Remove country code prefix (+91 or 91) if present
  sanitized = sanitized.replace(/^(\+91|91)/, '');
  // Remove leading zeros
  sanitized = sanitized.replace(/^0+/, '');
  return sanitized;
};

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
  @Transform(({ value }) => sanitizePhoneNumber(value))
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required for delivery' })
  @Matches(/^[6-9]\d{9}$/, { message: 'Phone number must be a valid 10-digit Indian mobile number' })
  phoneNumber: string;
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

