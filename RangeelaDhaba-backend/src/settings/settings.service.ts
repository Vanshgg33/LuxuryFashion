import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RestaurantSettings, RestaurantSettingsDocument } from './schemas/restaurant-settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(RestaurantSettings.name)
    private settingsModel: Model<RestaurantSettingsDocument>,
  ) {}

  async getSettings() {
    const existing = await this.settingsModel.findOne();
    if (existing) return existing;
    return this.settingsModel.create({
      lat: Number(process.env.RESTAURANT_LAT) || 0,
      lng: Number(process.env.RESTAURANT_LNG) || 0,
      address: process.env.RESTAURANT_ADDRESS,
      supportEmail: process.env.SUPPORT_EMAIL || 'rangeela8981@gmail.com',
      supportPhone: process.env.SUPPORT_PHONE || '+91 89812 60291',
    });
  }

  async update(data: Partial<RestaurantSettings>) {
    const settings = await this.getSettings();
    Object.assign(settings, data);
    return settings.save();
  }
}


