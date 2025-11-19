import axiosInstance from './axiosInstance';
import { Order, OrderItem, OrderStatus } from '../types';

export const createOrder = async (
  sessionId: number,
  items: OrderItem[],
  notes?: string
): Promise<Order> => {
  const response = await axiosInstance.post<Order>('/orders', {
    sessionId,
    items,
    notes,
  });
  return response.data;
};

export const getOrder = async (orderId: number): Promise<Order> => {
  const response = await axiosInstance.get<Order>(`/orders/${orderId}`);
  return response.data;
};

export const getSessionOrders = async (sessionId: number): Promise<Order[]> => {
  const response = await axiosInstance.get<Order[]>(`/orders/session/${sessionId}`);
  return response.data;
};

export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatus,
  notes?: string
): Promise<Order> => {
  const response = await axiosInstance.put<Order>(`/orders/${orderId}`, {
    status,
    notes,
  });
  return response.data;
};

export const getKitchenOrders = async (branchId?: number): Promise<Order[]> => {
  const params = branchId ? { branchId } : {};
  const response = await axiosInstance.get<Order[]>('/kitchen/orders', { params });
  return response.data;
};

export const acceptOrder = async (orderId: number): Promise<Order> => {
  const response = await axiosInstance.post<Order>(`/kitchen/orders/${orderId}/accept`);
  return response.data;
};

export const markOrderReady = async (orderId: number): Promise<Order> => {
  const response = await axiosInstance.post<Order>(`/kitchen/orders/${orderId}/ready`);
  return response.data;
};

export const getWaiterOrders = async (branchId?: number): Promise<Order[]> => {
  const params = branchId ? { branchId } : {};
  const response = await axiosInstance.get<Order[]>('/waiter/orders', { params });
  return response.data;
};

export const serveOrder = async (orderId: number): Promise<Order> => {
  const response = await axiosInstance.post<Order>(`/waiter/orders/${orderId}/serve`);
  return response.data;
};

