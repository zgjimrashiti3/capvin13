export declare class OrderItemDto {
    menuItemId: string;
    quantity: number;
    notes?: string;
}
export declare class CreateOrderDto {
    tableNumber: number;
    items: OrderItemDto[];
}
