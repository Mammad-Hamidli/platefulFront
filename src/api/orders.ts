import api from './apiClient';
import type { Order } from '../types';

export const ordersApi = {
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  getOrder: async (id: number): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData: Partial<Order>): Promise<Order> => {
    const response = await api.post<Order>('/orders', orderData);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: Order['status']): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },
};

