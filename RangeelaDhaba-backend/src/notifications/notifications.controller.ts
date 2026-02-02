import { Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtUserPayload } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtUserPayload) {
    return this.notificationsService.findAll(user.userId);
  }

  @Get('unread')
  findUnread(@CurrentUser() user: JwtUserPayload) {
    return this.notificationsService.findUnread(user.userId);
  }

  @Get('count')
  getUnreadCount(@CurrentUser() user: JwtUserPayload) {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser() user: JwtUserPayload, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.userId, id);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: JwtUserPayload) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Delete(':id')
  delete(@CurrentUser() user: JwtUserPayload, @Param('id') id: string) {
    return this.notificationsService.delete(user.userId, id);
  }

  @Delete()
  clearAll(@CurrentUser() user: JwtUserPayload): Promise<import('mongoose').DeleteResult> {
    return this.notificationsService.clearAll(user.userId);
  }
}






