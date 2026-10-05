import { MessageEvent, OnModuleDestroy } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Order } from '../entities/order.entity';
export type OrderEventType = 'order.created' | 'order.updated';
export declare class OrderEventsService implements OnModuleDestroy {
    private readonly events$;
    emit(type: OrderEventType, order: Order): void;
    stream(): Observable<MessageEvent>;
    onModuleDestroy(): void;
}
