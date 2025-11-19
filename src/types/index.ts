// User & Auth Types
export type UserRole = 'CUSTOMER' | 'WAITER' | 'KITCHEN' | 'ADMIN' | 'SUPERADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  restaurantId?: number;
  branchId?: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Menu Types
export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
  restaurantId: number;
  branchId?: number;
}

export interface MenuCategory {
  id: number;
  name: string;
  items: MenuItem[];
}

// Order Types
export type OrderStatus = 
  | 'ORDERED' 
  | 'PREPARING' 
  | 'PREPARED_WAITING' 
  | 'SERVED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface OrderItem {
  menuItemId: number;
  quantity: number;
  price: number;
  notes?: string;
  menuItem?: MenuItem;
}

export interface Order {
  id: number;
  sessionId: number;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  logs?: OrderLog[];
}

export interface OrderLog {
  id: number;
  orderId: number;
  status: OrderStatus;
  userId?: number;
  timestamp: string;
  notes?: string;
}

// Session Types
export interface Session {
  id: number;
  tableId: number;
  restaurantId: number;
  branchId: number;
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
  table?: Table;
}

// Table Types
export interface Table {
  id: number;
  number: string;
  capacity: number;
  restaurantId: number;
  branchId: number;
  qrCode?: string;
  isAvailable: boolean;
}

// Branch Types
export interface Branch {
  id: number;
  name: string;
  address: string;
  phone?: string;
  restaurantId: number;
  isActive: boolean;
}

// Restaurant Types
export interface Restaurant {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
}

// Payment Types
export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE';

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: PaymentMethod;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

// Analytics Types
export interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  activeSessions: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  revenueByDate: Array<{ date: string; revenue: number }>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

