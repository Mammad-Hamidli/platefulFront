import type { AxiosInstance } from 'axios';
import type { KitchenOrder } from '@/types/kitchen';

/**
 * Get all orders for a branch (only non-completed orders)
 * Uses Next.js API route which proxies to backend
 */
export const getKitchenOrders = async (
  api: AxiosInstance,
  branchId: number
): Promise<KitchenOrder[]> => {
  const { data } = await api.get<KitchenOrder[]>('/api/kitchen/orders', {
    params: { branchId },
  });
  return data;
};

/**
 * Accept an order (change status to ACCEPTED)
 * Uses Next.js API route which proxies to backend
 */
export const acceptOrder = async (api: AxiosInstance, orderId: number): Promise<KitchenOrder> => {
  const { data } = await api.put<KitchenOrder>(`/api/kitchen/orders/${orderId}/accept`);
  return data;
};

/**
 * Mark order as preparing (change status to PREPARING)
 * Uses Next.js API route which proxies to backend
 */
export const prepareOrder = async (
  api: AxiosInstance,
  orderId: number
): Promise<KitchenOrder> => {
  const { data } = await api.put<KitchenOrder>(`/api/kitchen/orders/${orderId}/prepare`);
  return data;
};

/**
 * Mark order as ready to serve (change status to READY_TO_SERVE)
 * Uses Next.js API route which proxies to backend
 */
export const readyOrder = async (api: AxiosInstance, orderId: number): Promise<KitchenOrder> => {
  const { data } = await api.put<KitchenOrder>(`/api/kitchen/orders/${orderId}/ready`);
  return data;
};

