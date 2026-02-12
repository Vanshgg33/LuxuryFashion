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
      isDeliveryEnabled: true,
      deliveryFee: 40,
      minOrderValue: 0,
      openingTime: '09:00',
      closingTime: '22:00',
      isOpen: true,
      closureReason: '',
      categoryTimeRestrictions: {},
    });
  }

  async update(data: Partial<RestaurantSettings>) {
    const settings = await this.getSettings();
    Object.assign(settings, data);
    return settings.save();
  }

  /**
   * Check if restaurant is currently open based on manual toggle and operating hours
   */
  async isRestaurantOpen(): Promise<{
    isOpen: boolean;
    openingTime: string;
    closingTime: string;
    currentTime: string;
    isManuallyClosed: boolean;
    closureReason?: string;
  }> {
    const settings = await this.getSettings();
    const openingTime = settings.openingTime || '09:00';
    const closingTime = settings.closingTime || '22:00';

    // Get current time in IST (Indian Standard Time) - using toLocaleString for accuracy
    const now = new Date();
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const currentHours = istTime.getHours().toString().padStart(2, '0');
    const currentMinutes = istTime.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;

    // Check if manually closed first
    if (settings.isOpen === false) {
      return {
        isOpen: false,
        openingTime,
        closingTime,
        currentTime,
        isManuallyClosed: true,
        closureReason: settings.closureReason,
      };
    }

    // Parse times to compare
    const [openHour, openMin] = openingTime.split(':').map(Number);
    const [closeHour, closeMin] = closingTime.split(':').map(Number);
    const [currHour, currMin] = [parseInt(currentHours), parseInt(currentMinutes)];

    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    const currentMinutesTotal = currHour * 60 + currMin;

    let isOpen: boolean;
    if (closeMinutes > openMinutes) {
      // Normal case: e.g., 09:00 to 22:00
      isOpen = currentMinutesTotal >= openMinutes && currentMinutesTotal < closeMinutes;
    } else {
      // Overnight case: e.g., 22:00 to 06:00
      isOpen = currentMinutesTotal >= openMinutes || currentMinutesTotal < closeMinutes;
    }

    return {
      isOpen,
      openingTime,
      closingTime,
      currentTime,
      isManuallyClosed: false,
    };
  }
}


