import { Order } from './order.entity';
import { MenuItem, ItemSize } from './menu-item.entity';
export declare class OrderItem {
    id: string;
    orderId: string;
    menuItemId: string | null;
    quantity: number;
    unitPrice: number;
    size: ItemSize | null;
    sizeLabel: string | null;
    notes: string | null;
    createdAt: Date;
    order: Order;
    menuItem: MenuItem | null;
}
