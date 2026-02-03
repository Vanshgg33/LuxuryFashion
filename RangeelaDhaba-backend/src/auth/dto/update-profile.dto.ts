import { IsString, IsOptional, IsNumber, ValidateNested, Matches } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Phone number sanitization - removes spaces, dashes, country code prefix, and leading zeros
const sanitizePhoneNumber = (value: string): string => {
  if (!value) return value;
  let sanitized = value.replace(/[^\d+]/g, '');
  sanitized = sanitized.replace(/^(\+91|91)/, '');
  sanitized = sanitized.replace(/^0+/, '');
  return sanitized;
};

export class ProfileAddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Transform(({ value }) => sanitizePhoneNumber(value))
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Phone number must be a valid 10-digit Indian mobile number' })
  phoneNumber?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Transform(({ value }) => sanitizePhoneNumber(value))
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Phone number must be a valid 10-digit Indian mobile number' })
  phoneNumber?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileAddressDto)
  address?: ProfileAddressDto;
}
