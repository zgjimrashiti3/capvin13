import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(MenuItem) private menuItemRepo: Repository<MenuItem>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const menuItemIds = dto.items.map((i) => i.menuItemId);
      const menuItems = await manager.findBy(MenuItem, { id: In(menuItemIds) });

      if (menuItems.length !== menuItemIds.length) {
        throw new BadRequestException('Disa artikuj nuk u gjetën.');
      }

      const unavailable = menuItems.filter((m) => !m.isAvailable);
      if (unavailable.length > 0) {
        throw new BadRequestException(
          `Artikujt e mëposhtëm nuk janë të disponueshëm: ${unavailable.map((m) => m.name).join(', ')}`,
        );
      }

      const itemMap = new Map(menuItems.map((m) => [m.id, m]));

      let totalPrice = 0;
      const orderItems: Partial<OrderItem>[] = dto.items.map((i) => {
        const menuItem = itemMap.get(i.menuItemId)!;
        const unitPrice = Number(menuItem.price);
        totalPrice += unitPrice * i.quantity;
        return {
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          unitPrice,
          notes: i.notes || null,
        };
      });

      const order = manager.create(Order, {
        tableNumber: dto.tableNumber,
        totalPrice: Math.round(totalPrice * 100) / 100,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await manager.save(Order, order);

      const items = orderItems.map((oi) =>
        manager.create(OrderItem, { ...oi, orderId: savedOrder.id }),
      );
      await manager.save(OrderItem, items);

      return manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: { items: { menuItem: true } },
      });
    });
  }

  async findAll(status?: string, date?: string): Promise<Order[]> {
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

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: { items: { menuItem: true } },
    });
    if (!order) throw new NotFoundException('Porosia nuk u gjet.');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    order.status = dto.status;
    await this.orderRepo.save(order);
    return this.findOne(id);
  }
}
