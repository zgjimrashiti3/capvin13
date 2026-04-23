import { Repository, DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersService {
    private orderRepo;
    private menuItemRepo;
    private dataSource;
    constructor(orderRepo: Repository<Order>, menuItemRepo: Repository<MenuItem>, dataSource: DataSource);
    create(dto: CreateOrderDto): Promise<Order>;
    findAll(status?: string, date?: string): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order>;
}
