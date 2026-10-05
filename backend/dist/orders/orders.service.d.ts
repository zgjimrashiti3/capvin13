import { Repository, DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderEventsService } from './order-events.service';
export declare class OrdersService {
    private orderRepo;
    private menuItemRepo;
    private dataSource;
    private orderEvents;
    constructor(orderRepo: Repository<Order>, menuItemRepo: Repository<MenuItem>, dataSource: DataSource, orderEvents: OrderEventsService);
    create(dto: CreateOrderDto): Promise<Order>;
    findAll(status?: string, date?: string): Promise<Order[]>;
    findAlerts(): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order>;
    acknowledge(id: string): Promise<Order>;
}
