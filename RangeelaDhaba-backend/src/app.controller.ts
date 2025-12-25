import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  health() {
    return {
      status: 'ok',
      message: 'Rangeela Dhaba API is running',
      timestamp: new Date().toISOString(),
      service: 'Rangeela Dhaba Backend API',
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      message: 'Health check passed',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}

