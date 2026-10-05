import { Injectable, MessageEvent, OnModuleDestroy } from '@nestjs/common';
import { Observable, Subject, interval, merge, of, map } from 'rxjs';
import { Order } from '../entities/order.entity';

export type OrderEventType = 'order.created' | 'order.updated';

const HEARTBEAT_MS = 25000;

// In-process event bus for admin order alerts. Works for a single backend
// instance; multiple instances would need a shared bus (e.g. Postgres NOTIFY).
@Injectable()
export class OrderEventsService implements OnModuleDestroy {
  private readonly events$ = new Subject<{ type: OrderEventType; order: Order }>();

  emit(type: OrderEventType, order: Order) {
    this.events$.next({ type, order });
  }

  stream(): Observable<MessageEvent> {
    return merge(
      // Sent immediately so the client knows the stream is live.
      of({ type: 'ready', data: {} }),
      this.events$.pipe(map((e) => ({ type: e.type, data: e.order }))),
      // Keeps proxies from closing idle connections and lets the client detect dead streams.
      interval(HEARTBEAT_MS).pipe(map(() => ({ type: 'ping', data: {} }))),
    );
  }

  onModuleDestroy() {
    this.events$.complete();
  }
}
