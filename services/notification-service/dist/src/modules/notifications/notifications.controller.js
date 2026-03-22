"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
const send_notification_dto_1 = require("./dto/send-notification.dto");
const update_settings_dto_1 = require("./dto/update-settings.dto");
const swagger_1 = require("@nestjs/swagger");
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async sendNotification(sendNotificationDto) {
        return this.notificationsService.sendNotification(sendNotificationDto);
    }
    async getHistory() {
        return this.notificationsService.getHistory();
    }
    async getHistoryByRecipient(recipient) {
        return this.notificationsService.getHistoryByRecipient(recipient);
    }
    async updateSettings(updateSettingsDto) {
        return this.notificationsService.updateSettings(updateSettingsDto);
    }
    async getSettings(userId) {
        return this.notificationsService.getSettings(userId);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Send a notification (email)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Notification queued/sent successfully.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_notification_dto_1.SendNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendNotification", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all notification history' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('history/:recipient'),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification history for a specific recipient' }),
    __param(0, (0, common_1.Param)('recipient')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getHistoryByRecipient", null);
__decorate([
    (0, common_1.Post)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Configure or update notification settings for a user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_settings_dto_1.UpdateNotificationSettingsDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Get)('settings/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification settings for a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getSettings", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map