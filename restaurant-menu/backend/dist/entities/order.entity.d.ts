import { OrderItem } from './order-item.entity';
export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    READY = "READY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export declare class Order {
    id: string;
    tableNumber: number;
    status: OrderStatus;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
    items: OrderItem[];
}
