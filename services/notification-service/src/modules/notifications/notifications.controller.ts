import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { UpdateNotificationSettingsDto } from './dto/update-settings.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Send a notification (email)' })
  @ApiResponse({
    status: 201,
    description: 'Notification queued/sent successfully.',
  })
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    return this.notificationsService.sendNotification(sendNotificationDto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get all notification history' })
  async getHistory() {
    return this.notificationsService.getHistory();
  }

  @Get('history/:recipient')
  @ApiOperation({
    summary: 'Get notification history for a specific recipient',
  })
  async getHistoryByRecipient(@Param('recipient') recipient: string) {
    return this.notificationsService.getHistoryByRecipient(recipient);
  }

  @Post('settings')
  @ApiOperation({
    summary: 'Configure or update notification settings for a user',
  })
  async updateSettings(
    @Body() updateSettingsDto: UpdateNotificationSettingsDto,
  ) {
    return this.notificationsService.updateSettings(updateSettingsDto);
  }

  @Get('settings/:userId')
  @ApiOperation({ summary: 'Get notification settings for a user' })
  async getSettings(@Param('userId') userId: string) {
    return this.notificationsService.getSettings(userId);
  }
}
