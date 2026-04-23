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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../entities/order.entity");
const order_item_entity_1 = require("../entities/order-item.entity");
const menu_item_entity_1 = require("../entities/menu-item.entity");
let OrdersService = class OrdersService {
    constructor(orderRepo, menuItemRepo, dataSource) {
        this.orderRepo = orderRepo;
        this.menuItemRepo = menuItemRepo;
        this.dataSource = dataSource;
    }
    async create(dto) {
        return this.dataSource.transaction(async (manager) => {
            const menuItemIds = dto.items.map((i) => i.menuItemId);
            const menuItems = await manager.findBy(menu_item_entity_1.MenuItem, { id: (0, typeorm_2.In)(menuItemIds) });
            if (menuItems.length !== menuItemIds.length) {
                throw new common_1.BadRequestException('Disa artikuj nuk u gjetën.');
            }
            const unavailable = menuItems.filter((m) => !m.isAvailable);
            if (unavailable.length > 0) {
                throw new common_1.BadRequestException(`Artikujt e mëposhtëm nuk janë të disponueshëm: ${unavailable.map((m) => m.name).join(', ')}`);
            }
            const itemMap = new Map(menuItems.map((m) => [m.id, m]));
            let totalPrice = 0;
            const orderItems = dto.items.map((i) => {
                const menuItem = itemMap.get(i.menuItemId);
                const unitPrice = Number(menuItem.price);
                totalPrice += unitPrice * i.quantity;
                return {
                    menuItemId: i.menuItemId,
                    quantity: i.quantity,
                    unitPrice,
                    notes: i.notes || null,
                };
            });
            const order = manager.create(order_entity_1.Order, {
                tableNumber: dto.tableNumber,
                totalPrice: Math.round(totalPrice * 100) / 100,
                status: order_entity_1.OrderStatus.PENDING,
            });
            const savedOrder = await manager.save(order_entity_1.Order, order);
            const items = orderItems.map((oi) => manager.create(order_item_entity_1.OrderItem, { ...oi, orderId: savedOrder.id }));
            await manager.save(order_item_entity_1.OrderItem, items);
            return manager.findOne(order_entity_1.Order, {
                where: { id: savedOrder.id },
                relations: { items: { menuItem: true } },
            });
        });
    }
    async findAll(status, date) {
        const qb = this.orderRepo
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'item')
            .leftJoinAndSelect('item.menuItem', 'menuItem')
            .orderBy('order.createdAt', 'DESC');
        if (status) {
            qb.andWhere('order.status = :status', { status });
        }
        if (date) {
            qb.andWhere('DATE(order.createdAt) = :date', { date });
        }
        return qb.getMany();
    }
    async findOne(id) {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: { items: { menuItem: true } },
        });
        if (!order)
            throw new common_1.NotFoundException('Porosia nuk u gjet.');
        return order;
    }
    async updateStatus(id, dto) {
        const order = await this.findOne(id);
        order.status = dto.status;
        await this.orderRepo.save(order);
        return this.findOne(id);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(menu_item_entity_1.MenuItem)),
    __param(2, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], OrdersService);
//# sourceMappingURL=orders.service.js.map