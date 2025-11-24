export interface GuestSession {
  guestSessionId: string;
  restaurantId: number;
  branchId: number;
  tableId: number;
  createdAt: string;
  completed: boolean;
}

export interface CustomerMenuItem {
  id: number;
  name: string;
  description?: string | null;
  priceCents: number;
  price?: number;
  category?: string | null;
  isAvailable: boolean;
}

export interface CartItem {
  menuItemId: number;
  name: string;
  priceCents: number;
  quantity: number;
}

export interface CustomerOrder {
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

export interface OrderItem {
  menuItemId: number;
  name: string;
  priceCents: number;
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY_TO_SERVE' | 'COMPLETED';

export interface CreateOrderRequest {
  guestSessionId: string;
  branchId: number;
  tableId: number;
  items: {
    menuItemId: number;
    qty: number;
  }[];
}

export interface StartSessionRequest {
  branchId: number;
  tableId: number;
}

export interface StartSessionResponse {
  guestSessionId: string;
  restaurantId: number;
}

