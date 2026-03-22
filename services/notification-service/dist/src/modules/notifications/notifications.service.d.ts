import { Model } from 'mongoose';
import { NotificationHistory, NotificationHistoryDocument } from './schemas/notification-history.schema';
import { NotificationSettings, NotificationSettingsDocument } from './schemas/notification-settings.schema';
import { SendNotificationDto } from './dto/send-notification.dto';
import { UpdateNotificationSettingsDto } from './dto/update-settings.dto';
export declare class NotificationsService {
    private historyModel;
    private settingsModel;
    private readonly logger;
    private transporter;
    constructor(historyModel: Model<NotificationHistoryDocument>, settingsModel: Model<NotificationSettingsDocument>);
    sendNotification(sendNotificationDto: SendNotificationDto): Promise<NotificationHistory>;
    getHistory(): Promise<NotificationHistory[]>;
    getHistoryByRecipient(recipient: string): Promise<NotificationHistory[]>;
    updateSettings(updateSettingsDto: UpdateNotificationSettingsDto): Promise<NotificationSettings>;
    getSettings(userId: string): Promise<NotificationSettings>;
}
