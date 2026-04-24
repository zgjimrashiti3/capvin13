import apiClient from './client';
import type { Order, OrderStatus } from '../types';

export interface CreateOrderPayload {
  tableNumber: number;
  items: { menuItemId: string; quantity: number; notes?: string }[];
}

export const createOrder = (payload: CreateOrderPayload): Promise<Order> =>
  apiClient.post('/orders', payload).then((r) => r.data);

export const getOrders = (status?: string, date?: string): Promise<Order[]> => {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (date) params.date = date;
  return apiClient.get('/orders', { params }).then((r) => r.data);
};

export const getOrder = (id: string): Promise<Order> =>
  apiClient.get(`/orders/${id}`).then((r) => r.data);

export const updateOrderStatus = (id: string, status: OrderStatus): Promise<Order> =>
  apiClient.patch(`/orders/${id}/status`, { status }).then((r) => r.data);
