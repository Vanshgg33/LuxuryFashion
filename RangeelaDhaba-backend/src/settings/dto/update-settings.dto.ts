import { IsBoolean, IsNumber, IsOptional, IsString, Allow } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  isDeliveryEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  deliveryFee?: number;

  @IsOptional()
  @IsNumber()
  minOrderValue?: number;

  @IsOptional()
  @IsString()
  openingTime?: string;

  @IsOptional()
  @IsString()
  closingTime?: string;

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @IsOptional()
  @IsString()
  closureReason?: string;

  @IsOptional()
  @Allow()
  categoryTimeRestrictions?: Record<string, { availableFrom: string; availableTo: string; isEnabled: boolean }>;
}

