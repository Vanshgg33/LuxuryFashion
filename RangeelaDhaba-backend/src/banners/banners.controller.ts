import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BannersService } from './banners.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('banners')
export class BannersController {
  constructor(
    private bannersService: BannersService,
    private cloudinary: CloudinaryService,
  ) {}

  /**
   * Get all active banners (public - for homepage carousel)
   */
  @Get()
  getActiveBanners() {
    return this.bannersService.findActive();
  }

  /**
   * Get all banners including inactive (admin only)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin')
  getAllBanners() {
    return this.bannersService.findAll();
  }

  /**
   * Get banner limit info (admin only)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('limit')
  getLimitInfo() {
    return this.bannersService.getLimitInfo();
  }

  /**
   * Create a new banner (admin only, max 4)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title?: string,
  ) {
    let imageUrl = '';
    if (file) {
      const uploaded = await this.cloudinary.uploadBuffer(file, 'banners');
      imageUrl = uploaded.secure_url;
    }
    return this.bannersService.create({ imageUrl, title });
  }

  /**
   * Toggle banner active status (admin only)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.bannersService.toggleActive(id);
  }

  /**
   * Update banner (admin only)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title?: string,
    @Body('isActive') isActive?: string,
  ) {
    const updateData: { imageUrl?: string; title?: string; isActive?: boolean } = {};

    if (file) {
      const uploaded = await this.cloudinary.uploadBuffer(file, 'banners');
      updateData.imageUrl = uploaded.secure_url;
    }

    if (title !== undefined) {
      updateData.title = title;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive === 'true';
    }

    return this.bannersService.update(id, updateData);
  }

  /**
   * Delete banner (admin only)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.bannersService.delete(id);
  }

  /**
   * Reorder banners (admin only)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('reorder')
  reorder(@Body('orderedIds') orderedIds: string[]) {
    return this.bannersService.reorder(orderedIds);
  }
}
