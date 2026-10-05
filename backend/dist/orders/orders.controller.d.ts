import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderEventsService } from './order-events.service';
export declare class OrdersController {
    private readonly ordersService;
    private readonly orderEvents;
    constructor(ordersService: OrdersService, orderEvents: OrderEventsService);
    create(dto: CreateOrderDto): Promise<import("../entities/order.entity").Order>;
    findAll(status?: string, date?: string): Promise<import("../entities/order.entity").Order[]>;
    stream(): Observable<MessageEvent>;
    findAlerts(): Promise<import("../entities/order.entity").Order[]>;
    findOne(id: string): Promise<import("../entities/order.entity").Order>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<import("../entities/order.entity").Order>;
    acknowledge(id: string): Promise<import("../entities/order.entity").Order>;
}
