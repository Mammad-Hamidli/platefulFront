export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'WAITER' | 'KITCHEN' | 'CUSTOMER';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  restaurantId?: number;
  branchId?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  available: boolean;
}

export interface Order {
  id: number;
  tableId?: number;
  items: OrderItem[];
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED';
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  menuItem: MenuItem;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Restaurant {
  id: number;
  name: string;
  description?: string;
  address?: string;
}

export interface Branch {
  id: number;
  restaurantId: number;
  name: string;
  address?: string;
  phone?: string;
}

export interface Table {
  id: number;
  branchId: number;
  number: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

