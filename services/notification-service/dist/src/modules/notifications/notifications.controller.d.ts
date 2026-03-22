import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { UpdateNotificationSettingsDto } from './dto/update-settings.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    sendNotification(sendNotificationDto: SendNotificationDto): Promise<import("./schemas/notification-history.schema").NotificationHistory>;
    getHistory(): Promise<import("./schemas/notification-history.schema").NotificationHistory[]>;
    getHistoryByRecipient(recipient: string): Promise<import("./schemas/notification-history.schema").NotificationHistory[]>;
    updateSettings(updateSettingsDto: UpdateNotificationSettingsDto): Promise<import("./schemas/notification-settings.schema").NotificationSettings>;
    getSettings(userId: string): Promise<import("./schemas/notification-settings.schema").NotificationSettings>;
}
