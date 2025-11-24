import type { OrderStatus, OrderItem } from './customer';

export interface KitchenOrder {
  orderId: number;
  guestSessionId: string;
  branchId: number;
  tableId: number;
  tableNumber?: number | null;
  items: OrderItem[];
  totalCents: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

