import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from './schemas/banner.schema';

const MAX_BANNERS = 4;

@Injectable()
export class BannersService {
  constructor(@InjectModel(Banner.name) private bannerModel: Model<BannerDocument>) {}

  /**
   * Get all banners (for admin - includes inactive)
   */
  findAll() {
    return this.bannerModel.find().sort({ order: 1, createdAt: -1 }).exec();
  }

  /**
   * Get only active banners (for public display)
   */
  findActive() {
    return this.bannerModel.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).exec();
  }

  /**
   * Get banner count
   */
  async count() {
    return this.bannerModel.countDocuments();
  }

  /**
   * Create a new banner (with 4 banner limit)
   */
  async create(data: Partial<Banner>) {
    const currentCount = await this.count();
    if (currentCount >= MAX_BANNERS) {
      throw new BadRequestException(`Maximum of ${MAX_BANNERS} banners allowed. Please delete an existing banner first.`);
    }

    // Set order to next available position
    const lastBanner = await this.bannerModel.findOne().sort({ order: -1 });
    const nextOrder = lastBanner ? lastBanner.order + 1 : 0;

    return new this.bannerModel({
      ...data,
      order: nextOrder,
      isActive: true,
    }).save();
  }

  /**
   * Find banner by ID
   */
  async findOne(id: string) {
    const banner = await this.bannerModel.findById(id);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    return banner;
  }

  /**
   * Toggle banner active status
   */
  async toggleActive(id: string) {
    const banner = await this.findOne(id);
    banner.isActive = !banner.isActive;
    return banner.save();
  }

  /**
   * Update banner
   */
  async update(id: string, data: Partial<Banner>) {
    const banner = await this.bannerModel.findByIdAndUpdate(id, data, { new: true });
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    return banner;
  }

  /**
   * Delete banner
   */
  async delete(id: string) {
    const banner = await this.bannerModel.findByIdAndDelete(id);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    return { message: 'Banner deleted successfully', id };
  }

  /**
   * Reorder banners
   */
  async reorder(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      this.bannerModel.findByIdAndUpdate(id, { order: index }),
    );
    await Promise.all(updates);
    return this.findAll();
  }

  /**
   * Get banner limit info
   */
  async getLimitInfo() {
    const currentCount = await this.count();
    return {
      current: currentCount,
      max: MAX_BANNERS,
      remaining: Math.max(0, MAX_BANNERS - currentCount),
      canAdd: currentCount < MAX_BANNERS,
    };
  }
}
