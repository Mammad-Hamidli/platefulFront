import type { AxiosInstance } from 'axios';
import type {
  GuestSession,
  CustomerMenuItem,
  CustomerOrder,
  CreateOrderRequest,
  StartSessionRequest,
  StartSessionResponse,
} from '@/types/customer';

/**
 * Start a guest session for customer ordering
 * Uses Next.js API route which proxies to backend
 */
export const startCustomerSession = async (
  api: AxiosInstance,
  payload: StartSessionRequest
): Promise<StartSessionResponse> => {
  const { data } = await api.post<StartSessionResponse>('/api/customer/session/start', payload);
  return data;
};

/**
 * End a guest session (after payment)
 * Uses Next.js API route which proxies to backend
 */
export const endCustomerSession = async (
  api: AxiosInstance,
  guestSessionId: string
): Promise<void> => {
  await api.post('/api/customer/session/end', { guestSessionId });
};

/**
 * Get menu items for a branch
 * Uses Next.js API route which proxies to backend
 */
export const getCustomerMenu = async (
  api: AxiosInstance,
  branchId: number,
  tableId: number
): Promise<CustomerMenuItem[]> => {
  const { data } = await api.get<CustomerMenuItem[]>('/api/customer/menu', {
    params: { branchId, tableId },
  });
  return data;
};

/**
 * Create a customer order
 * Uses Next.js API route which proxies to backend
 */
export const createCustomerOrder = async (
  api: AxiosInstance,
  payload: CreateOrderRequest
): Promise<CustomerOrder> => {
  const { data } = await api.post<CustomerOrder>('/api/customer/orders', payload);
  return data;
};

