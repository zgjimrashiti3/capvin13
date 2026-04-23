import { Order } from './order.entity';
import { MenuItem } from './menu-item.entity';
export declare class OrderItem {
    id: string;
    orderId: string;
    menuItemId: string | null;
    quantity: number;
    unitPrice: number;
    notes: string | null;
    createdAt: Date;
    order: Order;
    menuItem: MenuItem | null;
}
