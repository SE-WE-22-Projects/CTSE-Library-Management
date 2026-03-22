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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationHistorySchema = exports.NotificationHistory = exports.NotificationStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "PENDING";
    NotificationStatus["SENT"] = "SENT";
    NotificationStatus["FAILED"] = "FAILED";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
let NotificationHistory = class NotificationHistory {
    recipient;
    subject;
    content;
    status;
    errorMessage;
};
exports.NotificationHistory = NotificationHistory;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], NotificationHistory.prototype, "recipient", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], NotificationHistory.prototype, "subject", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], NotificationHistory.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: NotificationStatus, default: NotificationStatus.PENDING }),
    __metadata("design:type", String)
], NotificationHistory.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], NotificationHistory.prototype, "errorMessage", void 0);
exports.NotificationHistory = NotificationHistory = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], NotificationHistory);
exports.NotificationHistorySchema = mongoose_1.SchemaFactory.createForClass(NotificationHistory);
//# sourceMappingURL=notification-history.schema.js.map