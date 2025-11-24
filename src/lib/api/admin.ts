import type { AxiosInstance } from 'axios';
import type { Branch, MenuItem, TableEntity, UserRecord } from '@/types/entities';

export interface StaffCreatePayload {
  username: string; // Required - backend expects username
  password?: string; // NOT allowed for staff roles - only for admin roles (but admins can't create other admins)
  role: 'ROLE_WAITER' | 'ROLE_KITCHEN' | 'ROLE_CASHIER'; // Must have ROLE_ prefix - ROLE_ADMIN is NOT allowed
  email?: string; // Optional - backend also accepts email
  phoneNumber: string; // Required - staff phone number
  salaryAmount: number; // Required - staff salary amount
  salaryPeriod: 'DAILY' | 'WEEKLY' | 'MONTHLY'; // Required - staff salary period
}

export interface StaffUpdatePayload {
  role?: 'ROLE_WAITER' | 'ROLE_KITCHEN' | 'ROLE_CASHIER'; // Must have ROLE_ prefix - ROLE_ADMIN is NOT allowed
  password?: string; // NOT allowed for staff roles
  phoneNumber?: string; // Optional - staff phone number
  salaryAmount?: number; // Optional - staff salary amount
  salaryPeriod?: 'DAILY' | 'WEEKLY' | 'MONTHLY'; // Optional - staff salary period
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
  phoneNumber?: string | null; // Staff phone number
  salaryAmount?: number | null; // Staff salary amount
  salaryPeriod?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null; // Staff salary period
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
  phoneNumber?: string | null; // Staff phone number
  salaryAmount?: number | null; // Staff salary amount
  salaryPeriod?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null; // Staff salary period
}

// Staff roles that admins can create/manage (excluding ROLE_ADMIN)
const STAFF_ROLES = new Set(['ROLE_WAITER', 'ROLE_KITCHEN', 'ROLE_CASHIER']);

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
    phoneNumber: user.phoneNumber ?? null,
    salaryAmount: user.salaryAmount ?? null,
    salaryPeriod: user.salaryPeriod ?? null,
    phone: user.phoneNumber ?? null, // Also map to phone for backwards compatibility
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
  // Backend endpoint: GET /api/admin/staff
  // Returns staff filtered by the currently logged-in admin's restaurant/branch
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
    // Primary endpoint: GET /admin/staff (backend filters by admin's restaurant/branch)
    const { data } = await api.get<UserDto[]>('/admin/staff');
    (data ?? [])
      .map(mapUserToRecord)
      .filter((user) => {
        // Additional client-side filter by branchId (backend should already filter, but double-check)
        const normalizedBranchId = ensureOptionalNumber(user.branchId);
        return normalizedBranchId === null || normalizedBranchId === branchId;
      })
      .filter((user) => STAFF_ROLES.has(user.role)) // Only include staff roles (exclude admins)
      .forEach(upsert);
  } catch (error) {
    console.warn('[api/admin] unable to load /admin/staff', error);
    
    // Fallback to legacy endpoints if new endpoint is not available
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
          phoneNumber: waiter.phoneNumber ?? null,
          salaryAmount: waiter.salaryAmount ?? null,
          salaryPeriod: waiter.salaryPeriod ?? null,
          phone: waiter.phoneNumber ?? null, // Also map to phone for backwards compatibility
        };
        if (STAFF_ROLES.has(record.role)) {
          upsert(record);
        }
      });
    } catch (fallbackError) {
      console.warn('[api/admin] unable to load /admin/waiters/my', fallbackError);
    }

    try {
      const { data } = await api.get<UserDto[]>('/users');
      (data ?? [])
        .map(mapUserToRecord)
        .filter((user) => user.branchId === branchId && STAFF_ROLES.has(user.role))
        .forEach(upsert);
    } catch (fallbackError) {
      console.warn('[api/admin] unable to load /users for staff list', fallbackError);
    }
  }

  return Array.from(staffMap.values());
};

export const createStaff = async (
  api: AxiosInstance,
  restaurantId: number,
  branchId: number,
  payload: StaffCreatePayload
) => {
  // Backend CreateUserRequest expects: username, role, email, restaurantId, branchId, phoneNumber, salaryAmount, salaryPeriod
  // Business rule: Admins CANNOT create other ADMIN accounts (only staff: WAITER, KITCHEN, CASHIER)
  // Business rule: Password MUST NOT be provided for staff roles
  const username = payload.username.trim();
  if (!username) {
    throw new Error('Username is required');
  }
  
  // Ensure role has ROLE_ prefix
  const role = payload.role.startsWith('ROLE_') ? payload.role : `ROLE_${payload.role}`;
  
  // Validate that admin is not trying to create another admin
  if (role === 'ROLE_ADMIN' || role === 'ROLE_SUPERADMIN') {
    throw new Error('You cannot create admin accounts. Only staff members (Waiter, Kitchen, Cashier) can be created.');
  }
  
  // Validate required staff fields
  if (!payload.phoneNumber || !payload.phoneNumber.trim()) {
    throw new Error('Phone number is required');
  }
  if (!payload.salaryAmount || payload.salaryAmount <= 0) {
    throw new Error('Salary amount must be a positive number');
  }
  if (!payload.salaryPeriod) {
    throw new Error('Salary period is required');
  }
  
  // Backend also requires email, so derive it from username if not provided
  const email = payload.email?.trim().toLowerCase() || `${username.toLowerCase().replace(/\s+/g, '.')}@restaurant.local`;
  
  // Build body - NO password field for staff roles
  const body: Record<string, unknown> = {
    username,
    role,
    email,
    restaurantId,
    branchId,
    phoneNumber: payload.phoneNumber.trim(),
    salaryAmount: Number(payload.salaryAmount),
    salaryPeriod: payload.salaryPeriod,
  };
  
  try {
    const { data } = await api.post<UserDto>('/admin/staff', body);
    return mapUserToRecord({
      id: data.id ?? null,
      username: data.username ?? username,
      email: data.email ?? email,
      role: data.role ?? role,
      restaurantId: data.restaurantId ?? restaurantId,
      branchId: data.branchId ?? branchId,
      phoneNumber: data.phoneNumber ?? payload.phoneNumber.trim(),
      salaryAmount: data.salaryAmount ?? payload.salaryAmount,
      salaryPeriod: data.salaryPeriod ?? payload.salaryPeriod,
    });
  } catch (error: any) {
    // Handle 403 Forbidden - admin trying to create admin account
    if (error?.response?.status === 403) {
      throw new Error('You cannot create admin accounts. Only staff members can be created.');
    }
    throw error;
  }
};

export const updateStaff = async (
  api: AxiosInstance,
  idOrUsername: string | number,
  currentRole: string,
  payload: StaffUpdatePayload
) => {
  // Backend endpoint: PUT /api/admin/staff/{id}
  // Backend UpdateUserRequest: role, phoneNumber, salaryAmount, salaryPeriod (all optional)
  // Business rule: Admins CANNOT update staff to ROLE_ADMIN
  // Business rule: Password updates are NOT allowed for staff roles
  const body: Record<string, unknown> = {};
  
  if (payload.role) {
    // Ensure role has ROLE_ prefix
    const role = payload.role.startsWith('ROLE_') ? payload.role : `ROLE_${payload.role}`;
    
    // Validate that admin is not trying to change role to admin
    if (role === 'ROLE_ADMIN' || role === 'ROLE_SUPERADMIN') {
      throw new Error('You cannot change staff role to admin. Only staff roles (Waiter, Kitchen, Cashier) are allowed.');
    }
    body.role = role;
  }
  
  // Password updates are NOT allowed for staff roles
  if (payload.password && payload.password.trim()) {
    throw new Error('Password cannot be updated for staff members. Only admin accounts can have passwords.');
  }
  
  // Update staff-specific fields if provided
  if (payload.phoneNumber !== undefined) {
    if (payload.phoneNumber && payload.phoneNumber.trim()) {
      body.phoneNumber = payload.phoneNumber.trim();
    } else if (payload.phoneNumber === null || payload.phoneNumber === '') {
      throw new Error('Phone number is required');
    }
  }
  
  if (payload.salaryAmount !== undefined) {
    if (payload.salaryAmount !== null && payload.salaryAmount <= 0) {
      throw new Error('Salary amount must be a positive number');
    }
    if (payload.salaryAmount !== null) {
      body.salaryAmount = Number(payload.salaryAmount);
    }
  }
  
  if (payload.salaryPeriod !== undefined && payload.salaryPeriod !== null) {
    body.salaryPeriod = payload.salaryPeriod;
  }
  
  // Use ID if available, otherwise fall back to username
  const identifier = typeof idOrUsername === 'number' ? idOrUsername : idOrUsername.toLowerCase();
  
  try {
    // Use the admin staff endpoint for updates: PUT /api/admin/staff/{id}
    const { data } = await api.put<UserDto>(`/admin/staff/${encodeURIComponent(String(identifier))}`, body);
    return mapUserToRecord({
      id: data.id ?? null,
      username: data.username ?? (typeof idOrUsername === 'string' ? idOrUsername : null),
      email: data.email ?? null,
      role: data.role ?? payload.role ?? currentRole,
      restaurantId: data.restaurantId ?? null,
      branchId: data.branchId ?? null,
      phoneNumber: data.phoneNumber ?? payload.phoneNumber ?? null,
      salaryAmount: data.salaryAmount ?? payload.salaryAmount ?? null,
      salaryPeriod: data.salaryPeriod ?? payload.salaryPeriod ?? null,
    });
  } catch (error: any) {
    // Handle 403 Forbidden - admin trying to update to admin role
    if (error?.response?.status === 403) {
      throw new Error('You cannot update staff to admin accounts. Only staff roles are allowed.');
    }
    throw error;
  }
};

export const deleteStaff = async (api: AxiosInstance, idOrUsername: string | number) => {
  // Backend endpoint: DELETE /api/admin/staff/{id}
  // Backend validates that admin cannot delete admin accounts
  // Prefer ID if available, otherwise use username
  const identifier = typeof idOrUsername === 'number' ? idOrUsername : idOrUsername.toLowerCase();
  try {
    await api.delete(`/admin/staff/${encodeURIComponent(String(identifier))}`);
  } catch (error: any) {
    // Handle 403 Forbidden - admin trying to delete admin account
    if (error?.response?.status === 403) {
      throw new Error('You cannot delete admin accounts. Only staff members can be deleted.');
    }
    throw error;
  }
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

