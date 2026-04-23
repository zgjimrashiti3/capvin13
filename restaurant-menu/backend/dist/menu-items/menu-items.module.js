"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItemsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const menu_items_controller_1 = require("./menu-items.controller");
const menu_items_service_1 = require("./menu-items.service");
const menu_item_entity_1 = require("../entities/menu-item.entity");
const category_entity_1 = require("../entities/category.entity");
let MenuItemsModule = class MenuItemsModule {
};
exports.MenuItemsModule = MenuItemsModule;
exports.MenuItemsModule = MenuItemsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([menu_item_entity_1.MenuItem, category_entity_1.Category])],
        controllers: [menu_items_controller_1.MenuItemsController],
        providers: [menu_items_service_1.MenuItemsService],
    })
], MenuItemsModule);
//# sourceMappingURL=menu-items.module.js.map