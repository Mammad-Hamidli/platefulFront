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

export interface AdminUser {
  id: number;
  username: string;
  email?: string;
  role: 'ROLE_ADMIN';
  branchId?: number | null;
}

export interface WaiterUser {
  id: number;
  username: string;
  email?: string;
  role: 'ROLE_WAITER';
  branchId?: number | null;
}

export interface StaffMember {
  id: number;
  username: string;
  email?: string;
  role: 'ROLE_ADMIN' | 'ROLE_WAITER';
  branchId?: number | null;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  available?: boolean;
  branchId?: number;
}

export interface TableEntity {
  id: number;
  number: number;
  capacity: number;
  status?: string;
  branchId: number;
}

