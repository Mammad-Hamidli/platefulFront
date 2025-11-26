import type { AxiosInstance } from 'axios';
import type { Branch, Restaurant, UserRecord } from '@/types/entities';

export interface BranchCreatePayload {
  name: string;
  adminUserId?: number | null;
}

export interface BranchUpdatePayload {
  name?: string;
  adminUserId?: number | null;
}

export interface AdminCreatePayload {
  email: string;
  password: string;
  branchId?: number | null;
}

export interface AdminUpdatePayload {
  password?: string;
  branchId?: number | null;
}

const encodeEmail = (email: string) => encodeURIComponent(email.toLowerCase());

export const getRestaurant = async (api: AxiosInstance, restaurantId: number) => {
  const { data } = await api.get<Restaurant>(`/restaurants/${restaurantId}`);
  return data;
};

export const listBranches = async (api: AxiosInstance, restaurantId: number) => {
  const { data } = await api.get<Branch[]>(`/restaurants/${restaurantId}/branches`);
  return data ?? [];
};

export const createBranch = async (
  api: AxiosInstance,
  restaurantId: number,
  payload: BranchCreatePayload
) => {
  const body: Record<string, unknown> = {
    name: payload.name,
    restaurantId,
  };
  if (payload.adminUserId !== undefined && payload.adminUserId !== null) {
    body.adminUserId = payload.adminUserId;
  }
  const { data } = await api.post<Branch>(`/restaurants/${restaurantId}/branches`, body);
  return data;
};

export const updateBranch = async (
  api: AxiosInstance,
  branchId: number,
  payload: BranchUpdatePayload
) => {
  const { data } = await api.put<Branch>(`/branches/${branchId}`, payload);
  return data;
};

export const deleteBranch = async (api: AxiosInstance, branchId: number) => {
  await api.delete(`/branches/${branchId}`);
};

export const assignAdminToBranch = async (
  api: AxiosInstance,
  branchId: number,
  adminUserId: number
) => {
  await api.post(`/branches/${branchId}/assign-admin`, { adminUserId });
};

export const listAdminsForRestaurant = async (api: AxiosInstance, restaurantId: number) => {
  const { data } = await api.get<UserRecord[]>('/users', {
    params: { restaurantId },
  });
  return (data ?? []).filter((user) => user.role === 'ROLE_ADMIN');
};

export const createAdmin = async (
  api: AxiosInstance,
  restaurantId: number,
  payload: AdminCreatePayload
) => {
  const { data } = await api.post<UserRecord>('/superadmin/users', {
    email: payload.email.toLowerCase(),
    password: payload.password,
    role: 'BRANCH_MANAGER',
    restaurantId,
    ...(payload.branchId !== undefined && payload.branchId !== null ? { branchId: payload.branchId } : {}),
  });
  return data;
};

export const updateAdmin = async (
  api: AxiosInstance,
  email: string,
  payload: AdminUpdatePayload
) => {
  const { data } = await api.patch<UserRecord>(`/users/${encodeEmail(email)}`, {
    ...(payload.password ? { password: payload.password } : {}),
    ...(payload.branchId !== undefined ? { branchId: payload.branchId } : {}),
  });
  return data;
};

export const resetAdminPassword = async (
  api: AxiosInstance,
  adminId: number,
  newPassword: string
) => {
  const { data } = await api.post<{
    status: string;
    message: string;
    newPassword: string;
    adminEmail: string;
    adminUserId: number;
  }>(`/superadmin/admins/${adminId}/reset-password`, {
    newPassword,
  });
  return data;
};

export const deleteAdmin = async (api: AxiosInstance, email: string) => {
  await api.delete(`/users/${encodeEmail(email)}`);
};

export const listRestaurantStaff = async (api: AxiosInstance, restaurantId: number) => {
  const { data } = await api.get<UserRecord[]>('/users', {
    params: { restaurantId },
  });
  return (data ?? []).filter((user) => user.role !== 'ROLE_ADMIN');
};

