import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('coupons')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  @Post('validate')
  async validate(@Body() dto: ValidateCouponDto) {
    // Normalize coupon code to uppercase
    return this.couponsService.validate({
      ...dto,
      code: dto.code.toUpperCase().trim(),
    });
  }

  @Get('active')
  async getActiveCoupons() {
    return this.couponsService.findActiveCoupons();
  }

  @Get(':code')
  async getByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async findAll() {
    return this.couponsService.findAll();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateCouponDto>) {
    return this.couponsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.couponsService.delete(id);
  }
}





