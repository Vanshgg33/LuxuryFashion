import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  get() {
    return this.settingsService.getSettings();
  }

  @Get('is-open')
  isOpen() {
    return this.settingsService.isRestaurantOpen();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch()
  update(@Body() body: UpdateSettingsDto) {
    return this.settingsService.update(body);
  }
}


