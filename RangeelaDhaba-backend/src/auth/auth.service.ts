import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotDto, ResetDto } from './dto/forgot.dto';
import { MailerService } from '../mailer/mailer.service';
import { UserDocument } from '../users/schemas/user.schema';

// Address type for profile update
interface AddressDto {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phoneNumber?: string;
  lat?: number;
  lng?: number;
}

// Google profile type
interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailer: MailerService,
  ) {}

  private signTokens(user: UserDocument) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'supersecretjwt',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'superrefreshsecret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already registered');
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      phoneNumber: dto.phoneNumber,
    });
    await this.mailer.sendWelcome(user.email, user.name);
    const tokens = this.signTokens(user);
    return { user: this.safeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.usersService.findByEmail(dto.email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }
      if (!user.password) {
        throw new UnauthorizedException('This account was created with Google. Please use Google Sign In.');
      }
      const match = await bcrypt.compare(dto.password, user.password);
      if (!match) {
        throw new UnauthorizedException('Invalid email or password');
      }
      const tokens = this.signTokens(user);
      return { user: this.safeUser(user), ...tokens };
    } catch (error) {
      // Re-throw UnauthorizedException as-is
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Handle database connection errors
      console.error('Login error:', error);
      throw new UnauthorizedException('Unable to connect to database. Please try again.');
    }
  }

  async googleLogin(profile: GoogleProfile) {
    // First try to find by googleId (most reliable)
    let user = await this.usersService.findByGoogleId(profile.googleId);

    if (!user) {
      // Try to find by email (user might have registered normally before)
      user = await this.usersService.findByEmail(profile.email);

      if (user) {
        // User exists but registered without Google - link their Google account
        await this.usersService.update(user.id, { googleId: profile.googleId });
        const updatedUser = await this.usersService.findById(user.id);
        if (!updatedUser) throw new UnauthorizedException('User not found after update');
        user = updatedUser;
      } else {
        // Completely new user - create account
        user = await this.usersService.create({
          name: profile.name || 'Guest',
          email: profile.email,
          googleId: profile.googleId,
        });
        // Send welcome email for new users
        await this.mailer.sendWelcome(user.email, user.name);
      }
    }

    const tokens = this.signTokens(user);
    return { user: this.safeUser(user), ...tokens };
  }

  async refresh(dto: RefreshDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'superrefreshsecret',
      });
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException();
      const tokens = this.signTokens(user);
      return { user: this.safeUser(user), ...tokens };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgot(dto: ForgotDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) return { message: 'If the email exists, OTP sent' };
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await this.usersService.update(user.id, { otpCode: otp, otpExpires: expires });
    await this.mailer.sendOtp(user.email, otp, user.name);
    return { message: 'OTP sent' };
  }

  async reset(dto: ResetDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.otpCode || !user.otpExpires) throw new BadRequestException('Invalid OTP');
    if (user.otpCode !== dto.otp || user.otpExpires < new Date()) {
      throw new BadRequestException('Invalid OTP');
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    await this.usersService.update(user.id, {
      password: hashed,
      otpCode: undefined,
      otpExpires: undefined,
    });
    return { message: 'Password reset successful' };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return this.safeUser(user);
  }

  async updateProfile(userId: string, dto: { name?: string; phoneNumber?: string; address?: AddressDto }) {
    const updateData: { name?: string; phoneNumber?: string; address?: AddressDto } = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.phoneNumber) {
      // Sanitize phone number - remove spaces, dashes, country code prefix, and leading zeros
      let sanitized = dto.phoneNumber.replace(/[^\d+]/g, '');
      sanitized = sanitized.replace(/^(\+91|91)/, '');
      sanitized = sanitized.replace(/^0+/, '');
      updateData.phoneNumber = sanitized;
    }
    if (dto.address) updateData.address = dto.address;

    const user = await this.usersService.update(userId, updateData);
    if (!user) throw new UnauthorizedException('User not found');
    return this.safeUser(user);
  }

  private safeUser(user: UserDocument) {
    const { password, otpCode, otpExpires, ...safe } = user.toObject ? user.toObject() : user;
    // Normalize phone field: ensure phoneNumber is always set (handle old 'phone' field)
    if (!safe.phoneNumber && safe.phone) {
      safe.phoneNumber = safe.phone;
    }
    return safe;
  }
}


