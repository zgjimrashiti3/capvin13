import { useEffect, useRef } from 'react';
import { getOrder } from '../api/orders';
import type { OrderStatus } from '../types';
import type { SessionOrder } from '../context/SessionOrdersContext';

const TERMINAL = new Set<OrderStatus>(['DELIVERED', 'CANCELLED']);

export function useOrderStatusPolling(
  sessionOrders: SessionOrder[],
  updateSessionOrderStatus: (id: string, status: OrderStatus) => void,
  showToast: (message: string, type?: 'success' | 'error') => void,
) {
  // Use refs so the interval callback always sees the latest values
  // without needing to restart the interval on every status change.
  const ordersRef = useRef(sessionOrders);
  const updateRef = useRef(updateSessionOrderStatus);
  const toastRef = useRef(showToast);
  const prevStatusRef = useRef<Record<string, OrderStatus>>({});

  useEffect(() => { ordersRef.current = sessionOrders; }, [sessionOrders]);
  useEffect(() => { updateRef.current = updateSessionOrderStatus; }, [updateSessionOrderStatus]);
  useEffect(() => { toastRef.current = showToast; }, [showToast]);

  useEffect(() => {
    const poll = async () => {
      const active = ordersRef.current.filter((o) => !TERMINAL.has(o.status));
      if (active.length === 0) return;

      for (const order of active) {
        try {
          const fresh = await getOrder(order.id);
          const freshStatus = fresh.status as OrderStatus;
          const prev = prevStatusRef.current[order.id] ?? order.status;

          if (freshStatus !== prev) {
            prevStatusRef.current[order.id] = freshStatus;
            updateRef.current(order.id, freshStatus);

            if (freshStatus === 'CONFIRMED') {
              toastRef.current(`Porosia #${order.orderNumber} u konfirmua ✅`, 'success');
            } else if (freshStatus === 'READY') {
              toastRef.current(`Porosia #${order.orderNumber} është gati! 🍽️ Kamarieri po vjen.`, 'success');
            }
          }
        } catch {
          // Ignore network errors silently — no retry spam
        }
      }
    };

    // Seed initial known statuses so first poll only fires on real changes
    ordersRef.current.forEach((o) => {
      prevStatusRef.current[o.id] ??= o.status;
    });

    const id = setInterval(poll, 15000);
    return () => clearInterval(id);
  }, []); // Runs once — all live data accessed via refs
}
