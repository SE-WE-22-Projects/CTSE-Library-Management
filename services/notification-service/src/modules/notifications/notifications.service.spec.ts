import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
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

jest.mock('nodemailer');

describe('NotificationsService', () => {
    let service: NotificationsService;
    let mockHistoryModel: any;
    let mockSettingsModel: any;
    let mockTransporter: any;

    const mockHistory = {
        _id: '507f1f77bcf86cd799439011',
        recipient: 'user@example.com',
        subject: 'Test Subject',
        content: 'Test Content',
        status: NotificationStatus.PENDING,
        errorMessage: undefined,
        save: jest.fn(),
    };

    const mockSettings = {
        _id: '507f1f77bcf86cd799439012',
        userId: 'user123',
        emailEnabled: true,
        promotionalEmails: false,
    };

    beforeEach(async () => {
        mockHistoryModel = jest.fn().mockImplementation((dto) => ({
            ...dto,
            _id: '507f1f77bcf86cd799439011',
            status: NotificationStatus.PENDING,
            save: jest.fn().mockImplementation(function () {
                return Promise.resolve(this);
            }),
        }));

        mockSettingsModel = jest.fn().mockImplementation((dto) => ({
            ...dto,
            _id: '507f1f77bcf86cd799439012',
        }));

        mockHistoryModel.find = jest.fn();
        mockHistoryModel.findOne = jest.fn();
        mockHistoryModel.findOneAndUpdate = jest.fn();

        mockSettingsModel.findOne = jest.fn();
        mockSettingsModel.findOneAndUpdate = jest.fn();

        mockTransporter = {
            sendMail: jest.fn(),
        };

        // Mock nodemailer
        const nodemailer = require('nodemailer');
        nodemailer.createTransport.mockReturnValue(mockTransporter);

        // Mock environment variables
        process.env.GMAIL_USER = 'test@gmail.com';
        process.env.GMAIL_APP_PASSWORD = 'testpassword';
        process.env.SMTP_FROM_EMAIL = 'no-reply@example.com';

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsService,
                {
                    provide: getModelToken(NotificationHistory.name),
                    useValue: mockHistoryModel,
                },
                {
                    provide: getModelToken(NotificationSettings.name),
                    useValue: mockSettingsModel,
                },
            ],
        }).compile();

        service = module.get<NotificationsService>(NotificationsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete process.env.GMAIL_USER;
        delete process.env.GMAIL_APP_PASSWORD;
        delete process.env.SMTP_FROM_EMAIL;
    });

    describe('sendNotification', () => {
        it('should send notification successfully', async () => {
            const sendNotificationDto: SendNotificationDto = {
                recipient: 'user@example.com',
                subject: 'Test Subject',
                content: 'Test Content',
            };

            mockSettingsModel.findOne.mockResolvedValue(null); 
            mockTransporter.sendMail.mockResolvedValue({ messageId: '123' });

            const result = await service.sendNotification(sendNotificationDto);

            expect(result).toBeDefined();
            expect(result.recipient).toBe(sendNotificationDto.recipient);
            expect(result.subject).toBe(sendNotificationDto.subject);
            expect(result.status).toBe(NotificationStatus.SENT);
            expect(mockTransporter.sendMail).toHaveBeenCalledWith({
                from: 'no-reply@example.com',
                to: 'user@example.com',
                subject: 'Test Subject',
                text: 'Test Content',
                html: '<p>Test Content</p>',
            });
        });

        it('should fail if user has disabled emails', async () => {
            const sendNotificationDto: SendNotificationDto = {
                recipient: 'user@example.com',
                subject: 'Test Subject',
                content: 'Test Content',
            };

            mockSettingsModel.findOne.mockResolvedValue({
                ...mockSettings,
                emailEnabled: false,
            });

            const result = await service.sendNotification(sendNotificationDto);

            expect(result.status).toBe(NotificationStatus.FAILED);
            expect(result.errorMessage).toBe('User has disabled email notifications');
            expect(mockTransporter.sendMail).not.toHaveBeenCalled();
        });

        it('should handle email sending failure', async () => {
            const sendNotificationDto: SendNotificationDto = {
                recipient: 'user@example.com',
                subject: 'Test Subject',
                content: 'Test Content',
            };

            mockSettingsModel.findOne.mockResolvedValue(null);
            mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

            const result = await service.sendNotification(sendNotificationDto);

            expect(result.status).toBe(NotificationStatus.FAILED);
            expect(result.errorMessage).toBe('SMTP Error');
        });
    });

    describe('getHistory', () => {
        it('should return all notification history', async () => {
            const mockHistories = [mockHistory];

            mockHistoryModel.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockHistories),
                }),
            });

            const result = await service.getHistory();

            expect(result).toEqual(mockHistories);
            expect(mockHistoryModel.find).toHaveBeenCalled();
        });
    });

    describe('getHistoryByRecipient', () => {
        it('should return history for specific recipient', async () => {
            const mockHistories = [mockHistory];

            mockHistoryModel.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockHistories),
                }),
            });

            const result = await service.getHistoryByRecipient('user@example.com');

            expect(result).toEqual(mockHistories);
            expect(mockHistoryModel.find).toHaveBeenCalledWith({
                recipient: 'user@example.com',
            });
        });
    });

    describe('updateSettings', () => {
        it('should update notification settings', async () => {
            const updateSettingsDto: UpdateNotificationSettingsDto = {
                userId: 'user123',
                emailEnabled: false,
                promotionalEmails: true,
            };

            mockSettingsModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({
                    ...mockSettings,
                    ...updateSettingsDto,
                }),
            });

            const result = await service.updateSettings(updateSettingsDto);

            expect(result).toBeDefined();
            expect(result.userId).toBe(updateSettingsDto.userId);
            expect(result.emailEnabled).toBe(updateSettingsDto.emailEnabled);
            expect(result.promotionalEmails).toBe(updateSettingsDto.promotionalEmails);
            expect(mockSettingsModel.findOneAndUpdate).toHaveBeenCalledWith(
                { userId: 'user123' },
                {
                    userId: 'user123',
                    emailEnabled: false,
                    promotionalEmails: true,
                },
                { new: true, upsert: true },
            );
        });
    });

    describe('getSettings', () => {
        it('should return existing settings', async () => {
            mockSettingsModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockSettings),
            });

            const result = await service.getSettings('user123');

            expect(result).toEqual(mockSettings);
            expect(mockSettingsModel.findOne).toHaveBeenCalledWith({ userId: 'user123' });
        });

        it('should return default settings if none exist', async () => {
            mockSettingsModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            const result = await service.getSettings('user123');

            expect(result).toBeDefined();
            expect(result.userId).toBe('user123');
            expect(result.emailEnabled).toBe(true);
            expect(result.promotionalEmails).toBe(true);
        });
    });
});