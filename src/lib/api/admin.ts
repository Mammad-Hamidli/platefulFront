import type { AxiosInstance } from 'axios';
import type { Branch, MenuItem, TableEntity, UserRecord } from '@/types/entities';

export interface StaffCreatePayload {
  username: string; // Required - backend expects username
  password?: string; // Required only for ROLE_ADMIN, must be null/omitted for WAITER/KITCHEN
  role: 'ROLE_WAITER' | 'ROLE_KITCHEN' | 'ROLE_ADMIN'; // Must have ROLE_ prefix
  email?: string; // Optional - backend also accepts email
}

export interface StaffUpdatePayload {
  role?: 'ROLE_WAITER' | 'ROLE_KITCHEN' | 'ROLE_ADMIN'; // Must have ROLE_ prefix
  password?: string; // Optional - can only update password for admin roles
}

export interface TablePayload {
  name: string; // Required
  tableNumber?: number | null; // Optional
  seatCount: number; // Required, must be positive
}

interface BranchSummaryResponse {
  branchId?: number;
  id?: number;
  name?: string;
  restaurantId?: number;
  adminUserId?: number | null;
}

interface UserDto {
  id?: number | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
  restaurantId?: number | null;
  branchId?: number | null;
}

interface MenuItemSummaryDto {
  menuItemId?: number;
  id?: number;
  restaurantId?: number;
  name?: string;
  description?: string | null;
  priceCents?: number | null;
  price?: number | null;
  category?: string | null;
  available?: boolean;
  isAvailable?: boolean;
}

interface TableSummaryDto {
  tableId?: number;
  id?: number;
  restaurantId?: number;
  branchId?: number;
  name?: string | null;
  tableNumber?: number | null;
  seatCount?: number | null;
  active?: boolean;
  isActive?: boolean;
}

interface WaiterSummaryDto {
  waiterId?: number | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
  restaurantId?: number | null;
  branchId?: number | null;
}

const STAFF_ROLES = new Set(['ROLE_WAITER', 'ROLE_KITCHEN']);

const ensureNumber = (value: unknown, fallback = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const ensureOptionalNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const ROLE_ALIAS_MAP: Record<string, string> = {
  ROLE_SUPERADMIN: 'ROLE_SUPERADMIN',
  SUPERADMIN: 'ROLE_SUPERADMIN',
  ROLE_ADMIN: 'ROLE_ADMIN',
  ADMIN: 'ROLE_ADMIN',
  ROLE_BRANCH_MANAGER: 'ROLE_ADMIN',
  BRANCH_MANAGER: 'ROLE_ADMIN',
  ROLE_POS_STAFF: 'ROLE_WAITER',
  POS_STAFF: 'ROLE_WAITER',
  ROLE_WAITER: 'ROLE_WAITER',
  WAITER: 'ROLE_WAITER',
  ROLE_KITCHEN: 'ROLE_KITCHEN',
  KITCHEN: 'ROLE_KITCHEN',
};

const ensureRolePrefix = (role?: string | null): string => {
  if (!role) return '';
  const upper = role.toUpperCase();
  if (ROLE_ALIAS_MAP[upper]) {
    return ROLE_ALIAS_MAP[upper];
  }
  if (upper.startsWith('ROLE_') && ROLE_ALIAS_MAP[upper.substring(5)]) {
    return ROLE_ALIAS_MAP[upper.substring(5)];
  }
  return upper.startsWith('ROLE_') ? upper : `ROLE_${upper}`;
};

const mapBranchSummary = (payload: BranchSummaryResponse, fallbackId?: number): Branch => ({
  id: ensureNumber(payload?.branchId ?? payload?.id ?? fallbackId ?? 0),
  name: payload?.name ?? '',
  restaurantId: ensureNumber(payload?.restaurantId),
  adminUserId: payload?.adminUserId ?? null,
});

const mapUserToRecord = (user: UserDto): UserRecord => {
  const normalizedRole = ensureRolePrefix(user.role);
  const email = user.email ?? user.username ?? null;
  const restaurantId = ensureOptionalNumber(user.restaurantId);
  const branchId = ensureOptionalNumber(user.branchId);
  return {
    id: user.id ?? null,
    username: user.username ?? null,
    email,
    role: normalizedRole,
    restaurantId,
    branchId,
  };
};

const mapMenuItem = (item: MenuItemSummaryDto): MenuItem => ({
  id: ensureNumber(item.menuItemId ?? item.id),
  restaurantId: ensureNumber(item.restaurantId),
  name: item.name ?? '',
  description: item.description ?? null,
  priceCents: item.priceCents ?? null,
  price: item.price ?? (item.priceCents !== undefined && item.priceCents !== null ? item.priceCents / 100 : null),
  category: item.category ?? null,
  isAvailable: item.available ?? item.isAvailable ?? false,
});

const mapTable = (table: TableSummaryDto): TableEntity => ({
  id: ensureNumber(table.tableId ?? table.id),
  restaurantId: ensureNumber(table.restaurantId),
  branchId: ensureNumber(table.branchId),
  name: table.name ?? null,
  tableNumber: table.tableNumber ?? null,
  seatCount: table.seatCount ?? null,
  active: table.active ?? table.isActive ?? false,
  qrCode: null,
});

export const getBranch = async (api: AxiosInstance, branchId: number) => {
  try {
    const { data } = await api.get<BranchSummaryResponse>('/admin/branches/my');
    return mapBranchSummary(data, branchId);
  } catch (error) {
    console.warn('[api/admin] falling back to /branches/{id}', error);
    const { data } = await api.get<Branch>(`/branches/${branchId}`);
    return data;
  }
};

export const listStaff = async (api: AxiosInstance, branchId: number) => {
  const staffMap = new Map<string, UserRecord>();

  const upsert = (record: UserRecord) => {
    if (!record) return;
    const key =
      record.username?.toLowerCase() ??
      record.email?.toLowerCase() ??
      (record.id !== null && record.id !== undefined ? `id:${record.id}` : undefined);
    if (!key) return;
    const existing = staffMap.get(key);
    staffMap.set(
      key,
      existing
        ? {
            ...existing,
            ...record,
          }
        : record
    );
  };

  try {
    const { data } = await api.get<WaiterSummaryDto[]>('/admin/waiters/my');
    (data ?? []).forEach((waiter) => {
      const normalizedBranchId = ensureOptionalNumber(waiter.branchId);
      if (normalizedBranchId !== null && normalizedBranchId !== branchId) {
        return;
      }
      const record: UserRecord = {
        id: waiter.waiterId ?? null,
        username: waiter.username ?? null,
        email: waiter.email ?? waiter.username ?? null,
        role: ensureRolePrefix(waiter.role) || 'ROLE_WAITER',
        restaurantId: waiter.restaurantId ?? null,
        branchId: waiter.branchId ?? null,
      };
      if (STAFF_ROLES.has(record.role)) {
        upsert(record);
      }
    });
  } catch (error) {
    console.warn('[api/admin] unable to load /admin/waiters/my', error);
  }

  try {
    const { data } = await api.get<UserDto[]>('/users');
    (data ?? [])
      .map(mapUserToRecord)
      .filter((user) => user.branchId === branchId && STAFF_ROLES.has(user.role))
      .forEach(upsert);
  } catch (error) {
    console.warn('[api/admin] unable to load /users for staff list', error);
  }

  return Array.from(staffMap.values());
};

export const createStaff = async (
  api: AxiosInstance,
  restaurantId: number,
  branchId: number,
  payload: StaffCreatePayload
) => {
  // Backend CreateUserRequest expects: username, password (only for admin roles), role, email, restaurantId, branchId
  // Business rule: Password REQUIRED for ROLE_SUPERADMIN and ROLE_ADMIN
  // Password MUST be null/not provided for WAITER, KITCHEN, etc.
  const username = payload.username.trim();
  if (!username) {
    throw new Error('Username is required');
  }
  // Ensure role has ROLE_ prefix
  const role = payload.role.startsWith('ROLE_') ? payload.role : `ROLE_${payload.role}`;
  const isAdminRole = role === 'ROLE_ADMIN' || role === 'ROLE_SUPERADMIN';
  
  // Backend also requires email, so derive it from username if not provided
  const email = payload.email?.trim().toLowerCase() || `${username.toLowerCase().replace(/\s+/g, '.')}@restaurant.local`;
  
  // Build body based on role
  const body: Record<string, unknown> = {
    username,
    role,
    email,
    restaurantId,
    branchId,
  };
  
  // Only include password for admin roles
  if (isAdminRole) {
    const password = payload.password?.trim();
    if (!password) {
      throw new Error('Password is required for admin roles');
    }
    body.password = password;
  } else {
    // For non-admin roles, do NOT include password field at all
    // Backend will reject if password is provided for non-admin roles
  }
  
  const { data } = await api.post<UserDto>('/users', body);
  return mapUserToRecord({
    id: data.id ?? null,
    username: data.username ?? username,
    email: data.email ?? email,
    role: data.role ?? role,
    restaurantId: data.restaurantId ?? restaurantId,
    branchId: data.branchId ?? branchId,
  });
};

export const updateStaff = async (
  api: AxiosInstance,
  usernameOrEmail: string,
  currentRole: string,
  payload: StaffUpdatePayload
) => {
  const username = usernameOrEmail.toLowerCase();
  // Backend UpdateUserRequest: password, role, restaurantId, branchId (all optional)
  // Business rule: Password can only be updated for ROLE_SUPERADMIN and ROLE_ADMIN
  const body: Record<string, unknown> = {};
  if (payload.role) {
    // Ensure role has ROLE_ prefix
    const role = payload.role.startsWith('ROLE_') ? payload.role : `ROLE_${payload.role}`;
    body.role = role;
  }
  
  // Only allow password updates for admin roles
  const isAdminRole = currentRole === 'ROLE_ADMIN' || currentRole === 'ROLE_SUPERADMIN';
  if (payload.password && payload.password.trim()) {
    if (!isAdminRole) {
      throw new Error('Password cannot be updated for non-admin roles. Only ROLE_ADMIN and ROLE_SUPERADMIN can have passwords.');
    }
    body.password = payload.password.trim();
  }
  
  const { data } = await api.patch<UserDto>(`/users/${encodeURIComponent(username)}`, body);
  return mapUserToRecord({
    id: data.id ?? null,
    username: data.username ?? username,
    email: data.email ?? username,
    role: data.role ?? payload.role ?? currentRole,
    restaurantId: data.restaurantId ?? null,
    branchId: data.branchId ?? null,
  });
};

export const deleteStaff = async (api: AxiosInstance, usernameOrId: string | number) => {
  // Backend delete endpoint uses username, not ID
  // If usernameOrId is a number, we need to find the username first
  // But for simplicity, we'll use the provided identifier as username
  const identifier = typeof usernameOrId === 'number' ? String(usernameOrId) : usernameOrId;
  await api.delete(`/users/${encodeURIComponent(identifier.toLowerCase())}`);
};

export const listTables = async (api: AxiosInstance, restaurantId: number, branchId: number) => {
  const { data } = await api.get<TableSummaryDto[]>('/admin/tables/my');
  if (data && data.length > 0) {
    return data.filter((table) => ensureNumber(table.branchId) === branchId).map(mapTable);
  }

  const fallback = await api.get<TableEntity[]>('/tables', {
    params: { restId: restaurantId },
  });
  return (fallback.data ?? []).filter((table) => table.branchId === branchId);
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
  const body = {
    restaurantId,
    branchId,
    name: payload.name.trim(),
    seatCount: Number(payload.seatCount), // Must be positive Integer
    tableNumber: payload.tableNumber ? Number(payload.tableNumber) : null,
  };
  const { data } = await api.post<TableSummaryDto>('/tables', body);
  return mapTable(data);
};

export const updateTable = async (
  api: AxiosInstance,
  tableId: number,
  restaurantId: number,
  branchId: number,
  payload: TablePayload
) => {
  // Backend updateTable uses CreateTableRequest (same as create)
  // Backend CreateTableRequest: restaurantId (required), branchId (required), name (required), 
  // seatCount (required, positive Integer), tableNumber (optional Integer)
  // NOTE: active field is NOT in CreateTableRequest - do not send it
  if (!payload.name || !payload.name.trim()) {
    throw new Error('Table name is required');
  }
  if (!payload.seatCount || payload.seatCount <= 0) {
    throw new Error('Seat count must be a positive number');
  }
  const body = {
    restaurantId,
    branchId,
    name: payload.name.trim(),
    seatCount: Number(payload.seatCount), // Must be positive Integer
    tableNumber: payload.tableNumber ? Number(payload.tableNumber) : null,
  };
  const { data } = await api.put<TableSummaryDto>(`/tables/${tableId}`, body);
  return mapTable(data);
};

export const deleteTable = async (api: AxiosInstance, tableId: number) => {
  await api.delete(`/tables/${tableId}`);
};

export const listMenuItems = async (api: AxiosInstance, restaurantId: number) => {
  try {
    const { data } = await api.get<MenuItemSummaryDto[]>('/menu/admin/all', {
      params: { restId: restaurantId },
    });
    return (data ?? []).map(mapMenuItem);
  } catch (error) {
    console.warn('[api/admin] unable to load /menu/admin/all', error);
    return [];
  }
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
  const { data } = await api.post<MenuItemSummaryDto>('/menu', body);
  return mapMenuItem(data);
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
  const { data } = await api.put<MenuItemSummaryDto>(`/menu/${menuItemId}`, body);
  return mapMenuItem(data);
};

export const deleteMenuItem = async (api: AxiosInstance, menuItemId: number) => {
  await api.delete(`/menu/${menuItemId}`);
};

