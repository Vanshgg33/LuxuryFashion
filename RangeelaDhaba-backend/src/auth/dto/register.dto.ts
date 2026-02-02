import { IsEmail, IsOptional, IsString, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

// Phone number sanitization - removes spaces, dashes, country code prefix, and leading zeros
const sanitizePhoneNumber = (value: string): string => {
  if (!value) return value;
  let sanitized = value.replace(/[^\d+]/g, '');
  sanitized = sanitized.replace(/^(\+91|91)/, '');
  // Remove leading zeros
  sanitized = sanitized.replace(/^0+/, '');
  return sanitized;
};

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @Transform(({ value }) => sanitizePhoneNumber(value))
  @IsOptional()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Phone number must be a valid 10-digit Indian mobile number' })
  phoneNumber?: string;
}


