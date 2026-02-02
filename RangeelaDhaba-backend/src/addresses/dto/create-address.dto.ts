import { IsString, IsOptional, IsNumber, IsBoolean, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

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

export class CreateAddressDto {
  @IsString()
  label: string;

  @IsString()
  @IsOptional()
  houseNumber?: string;

  @IsString()
  @IsOptional()
  apartment?: string;

  @IsString()
  @IsOptional()
  floor?: string;

  @IsString()
  street: string;

  @IsString()
  @IsOptional()
  area?: string;

  @IsString()
  @IsOptional()
  landmark?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;

  @IsString()
  @IsOptional()
  country?: string;

  @Transform(({ value }) => sanitizePhoneNumber(value))
  @IsString()
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, { message: 'Phone number must be a valid 10-digit Indian mobile number' })
  phoneNumber?: string;

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lng?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}






