import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationHistory, NotificationHistorySchema } from './schemas/notification-history.schema';
import { NotificationSettings, NotificationSettingsSchema } from './schemas/notification-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationHistory.name, schema: NotificationHistorySchema },
      { name: NotificationSettings.name, schema: NotificationSettingsSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
