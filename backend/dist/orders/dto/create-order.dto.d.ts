import { ItemSize } from '../../entities/menu-item.entity';
export declare class OrderItemDto {
    menuItemId: string;
    quantity: number;
    size?: ItemSize;
    notes?: string;
}
export declare class CreateOrderDto {
    tableNumber: number;
    items: OrderItemDto[];
}
