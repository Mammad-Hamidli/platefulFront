import type { AxiosInstance } from 'axios';
import type { Branch, MenuItem, TableEntity, UserRecord } from '@/types/entities';

export interface StaffCreatePayload {
  email: string;
  role: 'ROLE_WAITER' | 'ROLE_KITCHEN';
  password?: string;
}

export interface StaffUpdatePayload {
  role?: 'ROLE_WAITER' | 'ROLE_KITCHEN';
  password?: string;
}

export interface TablePayload {
  name?: string | null;
  tableNumber?: number | null;
  seatCount?: number | null;
  active?: boolean;
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
  const { data } = await api.post<TableEntity>('/tables', {
    restaurantId,
    branchId,
    name: payload.name ?? '',
    tableNumber: payload.tableNumber ?? null,
    seatCount: payload.seatCount ?? null,
    active: payload.active ?? true,
  });
  return data;
};

export const updateTable = async (
  api: AxiosInstance,
  tableId: number,
  payload: TablePayload
) => {
  const { data } = await api.put<TableEntity>(`/tables/${tableId}`, {
    name: payload.name ?? '',
    tableNumber: payload.tableNumber ?? null,
    seatCount: payload.seatCount ?? null,
    active: payload.active ?? true,
  });
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

