import type { AxiosInstance } from 'axios';
import type { Branch, MenuItem, TableEntity, UserRecord } from '@/types/entities';

export interface StaffCreatePayload {
  email: string;
  role: 'ROLE_WAITER' | 'ROLE_KITCHEN';
  password?: string;
  phoneNumber?: string;
  salaryAmount?: number;
  salaryPeriod?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export interface StaffUpdatePayload {
  role?: 'ROLE_WAITER' | 'ROLE_KITCHEN';
  password?: string;
}

export interface TablePayload {
  name?: string | null;
  tableNumber?: number | null;
  seatCount?: number | null;
  restaurantId?: number;
  branchId?: number;
}

const STAFF_ROLES = new Set(['ROLE_WAITER', 'ROLE_KITCHEN']);

export const getBranch = async (api: AxiosInstance, branchId: number) => {
  const { data } = await api.get<Branch>(`/branches/${branchId}`);
  return data;
};

export const listStaff = async (api: AxiosInstance, branchId: number) => {
  const { data } = await api.get<UserRecord[]>('/users', {
    params: { branchId },
  });
  return (data ?? []).filter((user) => STAFF_ROLES.has(user.role));
};

export const createStaff = async (
  api: AxiosInstance,
  restaurantId: number,
  branchId: number,
  payload: StaffCreatePayload
) => {
  const body: Record<string, unknown> = {
    email: payload.email.toLowerCase(),
    role: payload.role,
    restaurantId,
    branchId,
  };
  if (payload.password) {
    body.password = payload.password;
  }
  // Required fields for staff members
  if (payload.phoneNumber !== undefined && payload.phoneNumber !== null) {
    body.phoneNumber = payload.phoneNumber;
  }
  if (payload.salaryAmount !== undefined && payload.salaryAmount !== null) {
    // Ensure salaryAmount is sent as a number (float/double), not BigDecimal
    body.salaryAmount = Number(payload.salaryAmount);
  }
  if (payload.salaryPeriod !== undefined && payload.salaryPeriod !== null) {
    body.salaryPeriod = payload.salaryPeriod;
  }
  const { data } = await api.post<UserRecord>('/users', body);
  return data;
};

export const updateStaff = async (
  api: AxiosInstance,
  email: string,
  payload: StaffUpdatePayload
) => {
  const { data } = await api.patch<UserRecord>(`/users/${encodeURIComponent(email.toLowerCase())}`, {
    ...(payload.role ? { role: payload.role } : {}),
    ...(payload.password ? { password: payload.password } : {}),
  });
  return data;
};

export const deleteStaff = async (api: AxiosInstance, email: string) => {
  await api.delete(`/users/${encodeURIComponent(email.toLowerCase())}`);
};

export const listTables = async (api: AxiosInstance, restaurantId: number, branchId: number) => {
  const { data } = await api.get<TableEntity[]>('/tables', {
    params: { restId: restaurantId },
  });
  return (data ?? []).filter((table) => table.branchId === branchId);
};

export const createTable = async (
  api: AxiosInstance,
  restaurantId: number,
  branchId: number,
  payload: TablePayload
) => {
  // Backend CreateTableRequest: restaurantId (required), branchId (required), name (required),
  // seatCount (required, positive Integer), tableNumber (optional Integer)
  // NOTE: active field is NOT in CreateTableRequest - do not send it
  if (!payload.name || !payload.name.trim()) {
    throw new Error('Table name is required');
  }
  if (!payload.seatCount || payload.seatCount <= 0) {
    throw new Error('Seat count must be a positive number');
  }
  const body: Record<string, unknown> = {
    restaurantId,
    branchId,
    name: payload.name.trim(),
    seatCount: Number(payload.seatCount), // Must be positive Integer
  };
  // Only include tableNumber if it's provided (it's optional)
  if (payload.tableNumber !== undefined && payload.tableNumber !== null) {
    body.tableNumber = Number(payload.tableNumber);
  }
  const { data } = await api.post<TableEntity>('/tables', body);
  return data;
};

export const updateTable = async (
  api: AxiosInstance,
  tableId: number,
  payload: TablePayload
) => {
  const body: Record<string, unknown> = {
    name: payload.name ?? '',
    tableNumber: payload.tableNumber ?? null,
    seatCount: payload.seatCount ?? null,
  };
  if (payload.restaurantId !== undefined) {
    body.restaurantId = payload.restaurantId;
  }
  if (payload.branchId !== undefined) {
    body.branchId = payload.branchId;
  }
  const { data } = await api.put<TableEntity>(`/tables/${tableId}`, body);
  return data;
};

export const deleteTable = async (api: AxiosInstance, tableId: number) => {
  await api.delete(`/tables/${tableId}`);
};

export const listMenuItems = async (api: AxiosInstance, restaurantId: number) => {
  const { data } = await api.get<MenuItem[]>('/menu/admin/all', {
    params: { restId: restaurantId },
  });
  return data ?? [];
};

export const createMenuItem = async (
  api: AxiosInstance,
  restaurantId: number,
  payload: {
    name: string;
    description?: string | null;
    priceCents: number;
    category?: string | null;
    isAvailable?: boolean;
  }
) => {
  // Backend CreateMenuItemRequest: restaurantId (required), name (required), description (optional),
  // priceCents (required, positive Long), category (optional), isAvailable (optional Boolean, defaults to true)
  if (!payload.name || !payload.name.trim()) {
    throw new Error('Menu item name is required');
  }
  if (!payload.priceCents || payload.priceCents <= 0) {
    throw new Error('Price must be a positive number');
  }
  const body = {
    restaurantId,
    name: payload.name.trim(),
    description: payload.description?.trim() || null,
    priceCents: Number(payload.priceCents), // Must be positive Long
    category: payload.category?.trim() || null,
    isAvailable: payload.isAvailable !== undefined ? payload.isAvailable : true,
  };
  const { data } = await api.post<MenuItem>('/menu', body);
  return data;
};

export const updateMenuItem = async (
  api: AxiosInstance,
  menuItemId: number,
  payload: {
    name?: string | null;
    description?: string | null;
    priceCents?: number | null;
    category?: string | null;
    isAvailable?: boolean | null;
  }
) => {
  // Backend UpdateMenuItemRequest: all fields optional (name, description, priceCents, category, isAvailable)
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined && payload.name !== null) {
    body.name = payload.name.trim();
  }
  if (payload.description !== undefined) {
    body.description = payload.description?.trim() || null;
  }
  if (payload.priceCents !== undefined && payload.priceCents !== null) {
    if (payload.priceCents <= 0) {
      throw new Error('Price must be a positive number');
    }
    body.priceCents = Number(payload.priceCents);
  }
  if (payload.category !== undefined) {
    body.category = payload.category?.trim() || null;
  }
  if (payload.isAvailable !== undefined) {
    body.isAvailable = payload.isAvailable;
  }
  const { data } = await api.put<MenuItem>(`/menu/${menuItemId}`, body);
  return data;
};

export const deleteMenuItem = async (api: AxiosInstance, menuItemId: number) => {
  await api.delete(`/menu/${menuItemId}`);
};

