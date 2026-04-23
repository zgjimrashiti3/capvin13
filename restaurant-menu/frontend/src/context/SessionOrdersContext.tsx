import React, { createContext, useContext, useState, useCallback } from 'react';
import type { CartItem, OrderStatus } from '../types';

export interface SessionOrder {
  id: string;
  orderNumber: number;
  tableNumber: number;
  items: CartItem[];
  totalPrice: number;
  sentAt: string;
  status: OrderStatus;
}

interface SessionOrdersContextValue {
  sessionOrders: SessionOrder[];
  addSessionOrder: (order: Omit<SessionOrder, 'orderNumber'>) => void;
  updateSessionOrderStatus: (id: string, status: OrderStatus) => void;
  clearHistory: () => void;
}

const SessionOrdersContext = createContext<SessionOrdersContextValue | null>(null);

const HISTORY_KEY = 'capvin_session_orders';

export function SessionOrdersProvider({ children }: { children: React.ReactNode }) {
  const [sessionOrders, setSessionOrders] = useState<SessionOrder[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const persist = (orders: SessionOrder[]) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(orders));
    return orders;
  };

  const addSessionOrder = useCallback((order: Omit<SessionOrder, 'orderNumber'>) => {
    setSessionOrders((prev) => {
      const next: SessionOrder = { ...order, orderNumber: prev.length + 1 };
      return persist([next, ...prev]);
    });
  }, []);

  const updateSessionOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setSessionOrders((prev) => persist(prev.map((o) => (o.id === id ? { ...o, status } : o))));
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setSessionOrders([]);
  }, []);

  return (
    <SessionOrdersContext.Provider value={{ sessionOrders, addSessionOrder, updateSessionOrderStatus, clearHistory }}>
      {children}
    </SessionOrdersContext.Provider>
  );
}

export function useSessionOrders() {
  const ctx = useContext(SessionOrdersContext);
  if (!ctx) throw new Error('useSessionOrders must be used within SessionOrdersProvider');
  return ctx;
}
