import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

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

  @IsString()
  @IsOptional()
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






