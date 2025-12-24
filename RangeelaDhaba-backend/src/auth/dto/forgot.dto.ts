import { IsEmail, IsString, MinLength } from 'class-validator';

export class ForgotDto {
  @IsEmail()
  email: string;
}

export class ResetDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;

  @IsString()
  @MinLength(6)
  password: string;
}


