/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NotificationHistory,
  NotificationHistoryDocument,
  NotificationStatus,
} from './schemas/notification-history.schema';
import {
  NotificationSettings,
  NotificationSettingsDocument,
} from './schemas/notification-settings.schema';
import { SendNotificationDto } from './dto/send-notification.dto';
import { UpdateNotificationSettingsDto } from './dto/update-settings.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(NotificationHistory.name)
    private historyModel: Model<NotificationHistoryDocument>,
    @InjectModel(NotificationSettings.name)
    private settingsModel: Model<NotificationSettingsDocument>,
  ) {
    // Nodemailer configuration for Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // e.g., "your_email@gmail.com"
        pass: process.env.GMAIL_APP_PASSWORD, // 16-character App Password
      },
    });
  }

  async sendNotification(
    sendNotificationDto: SendNotificationDto,
  ): Promise<NotificationHistory> {
    const { recipient, subject, content } = sendNotificationDto;

    // Check user settings if they have emails enabled
    // Note: If users exist in another DPutB, this user ID might differ.
    // For simplicity, using email as user identifier for settings if userId is not provided
    const settings = await this.settingsModel.findOne({ userId: recipient });

    // Create history record as PENDING
    const historyRecord = new this.historyModel({
      recipient,
      subject,
      content,
      status: NotificationStatus.PENDING,
    });
    await historyRecord.save();

    if (settings && !settings.emailEnabled) {
      historyRecord.status = NotificationStatus.FAILED;
      historyRecord.errorMessage = 'User has disabled email notifications';
      await historyRecord.save();
      return historyRecord;
    }

    try {
      const mailOptions = {
        from:
          process.env.SMTP_FROM_EMAIL ||
          '"Notification Service" <no-reply@example.com>',
        to: recipient,
        subject: subject,
        text: content,
        html: `<p>${content}</p>`, // In a real app, use a template engine
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Message sent: ${info.messageId}`);

      historyRecord.status = NotificationStatus.SENT;
    } catch (error) {
      this.logger.error(`Failed to send email to ${recipient}`, error.stack);
      historyRecord.status = NotificationStatus.FAILED;
      historyRecord.errorMessage = error.message;
    }

    return historyRecord.save();
  }

  async getHistory(): Promise<NotificationHistory[]> {
    return this.historyModel.find().sort({ createdAt: -1 }).exec();
  }

  async getHistoryByRecipient(
    recipient: string,
  ): Promise<NotificationHistory[]> {
    return this.historyModel.find({ recipient }).sort({ createdAt: -1 }).exec();
  }

  async updateSettings(
    updateSettingsDto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettings> {
    const { userId, emailEnabled, promotionalEmails } = updateSettingsDto;

    return this.settingsModel
      .findOneAndUpdate(
        { userId },
        { userId, emailEnabled, promotionalEmails },
        { new: true, upsert: true }, // Create if doesn't exist
      )
      .exec();
  }

  async getSettings(userId: string): Promise<NotificationSettings> {
    const settings = await this.settingsModel.findOne({ userId }).exec();
    if (!settings) {
      // Return default settings if none exist
      return new this.settingsModel({
        userId,
        emailEnabled: true,
        promotionalEmails: true,
      });
    }
    return settings;
  }
}
