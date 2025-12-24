import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('summary')
  summary() {
    return this.analyticsService.summary();
  }

  @Get('status')
  status() {
    return this.analyticsService.statusBreakdown();
  }

  @Get('revenue')
  revenue() {
    return this.analyticsService.revenueByMonth();
  }

  @Get('bestsellers')
  bestSellers() {
    return this.analyticsService.bestSellers();
  }
}


