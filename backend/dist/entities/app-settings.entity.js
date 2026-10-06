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
exports.AppSettings = void 0;
const typeorm_1 = require("typeorm");
let AppSettings = class AppSettings {
};
exports.AppSettings = AppSettings;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], AppSettings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'show_images', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], AppSettings.prototype, "showImages", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AppSettings.prototype, "updatedAt", void 0);
exports.AppSettings = AppSettings = __decorate([
    (0, typeorm_1.Entity)('app_settings')
], AppSettings);
//# sourceMappingURL=app-settings.entity.js.map