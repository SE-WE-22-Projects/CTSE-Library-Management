"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_history_schema_1 = require("./schemas/notification-history.schema");
const notification_settings_schema_1 = require("./schemas/notification-settings.schema");
const nodemailer = __importStar(require("nodemailer"));
let NotificationsService = NotificationsService_1 = class NotificationsService {
    historyModel;
    settingsModel;
    logger = new common_1.Logger(NotificationsService_1.name);
    transporter;
    constructor(historyModel, settingsModel) {
        this.historyModel = historyModel;
        this.settingsModel = settingsModel;
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }
    async sendNotification(sendNotificationDto) {
        const { recipient, subject, content } = sendNotificationDto;
        const settings = await this.settingsModel.findOne({ userId: recipient });
        const historyRecord = new this.historyModel({
            recipient,
            subject,
            content,
            status: notification_history_schema_1.NotificationStatus.PENDING,
        });
        await historyRecord.save();
        if (settings && !settings.emailEnabled) {
            historyRecord.status = notification_history_schema_1.NotificationStatus.FAILED;
            historyRecord.errorMessage = 'User has disabled email notifications';
            await historyRecord.save();
            return historyRecord;
        }
        try {
            const mailOptions = {
                from: process.env.SMTP_FROM_EMAIL || '"Notification Service" <no-reply@example.com>',
                to: recipient,
                subject: subject,
                text: content,
                html: `<p>${content}</p>`,
            };
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Message sent: ${info.messageId}`);
            historyRecord.status = notification_history_schema_1.NotificationStatus.SENT;
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${recipient}`, error.stack);
            historyRecord.status = notification_history_schema_1.NotificationStatus.FAILED;
            historyRecord.errorMessage = error.message;
        }
        return historyRecord.save();
    }
    async getHistory() {
        return this.historyModel.find().sort({ createdAt: -1 }).exec();
    }
    async getHistoryByRecipient(recipient) {
        return this.historyModel.find({ recipient }).sort({ createdAt: -1 }).exec();
    }
    async updateSettings(updateSettingsDto) {
        const { userId, emailEnabled, promotionalEmails } = updateSettingsDto;
        return this.settingsModel.findOneAndUpdate({ userId }, { userId, emailEnabled, promotionalEmails }, { new: true, upsert: true }).exec();
    }
    async getSettings(userId) {
        const settings = await this.settingsModel.findOne({ userId }).exec();
        if (!settings) {
            return new this.settingsModel({ userId, emailEnabled: true, promotionalEmails: true });
        }
        return settings;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_history_schema_1.NotificationHistory.name)),
    __param(1, (0, mongoose_1.InjectModel)(notification_settings_schema_1.NotificationSettings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map