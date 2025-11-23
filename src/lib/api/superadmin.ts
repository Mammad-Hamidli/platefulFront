import type { AxiosInstance, AxiosError } from 'axios';
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
  fullName?: string;
  phoneNumber?: string;
  branchId?: number | null;
}

export interface AdminUpdatePayload {
  password?: string;
  branchId?: number | null;
}

interface SuperAdminRestaurantResponse {
  restaurantId?: number | null;
  id?: number | null;
  name?: string;
  timezone?: string | null;
  currency?: string | null;
  settingsJson?: string | null;
  ownerUserId?: number | null;
  ownerEmail?: string | null;
}

interface SuperAdminBranchResponse {
  id?: number;
  branchId?: number;
  restaurantId?: number;
  name?: string;
  managerUserId?: number | null;
  adminUserId?: number | null;
  managerUsername?: string | null;
  managerEmail?: string | null;
}

interface AdminSummaryResponse {
  adminUserId?: number | null;
  userId?: number | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
  restaurantId?: number | null;
  branchId?: number | null;
  fullName?: string | null;
  phoneNumber?: string | null;
}

interface SuperAdminUserResponse {
  userId?: number | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
  restaurantId?: number | null;
  branchId?: number | null;
}

interface UserDto {
  id?: number | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
  restaurantId?: number | null;
  branchId?: number | null;
}

const ensureNumber = (value: unknown, fallback = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const toNullableNumber = (value: unknown): number | null => {
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

const normalizeRestaurant = (payload: SuperAdminRestaurantResponse): Restaurant => {
  const rawRestaurantId = payload?.restaurantId ?? payload?.id;
  const resolvedRestaurantId = ensureNumber(rawRestaurantId, 0);
  const resolvedId = payload?.id !== undefined && payload?.id !== null ? ensureNumber(payload.id) : resolvedRestaurantId;

  return {
    restaurantId: resolvedRestaurantId,
    id: resolvedId || undefined,
    name: payload?.name ?? '',
    ownerUserId: toNullableNumber(payload?.ownerUserId),
    ownerEmail: payload?.ownerEmail ?? null,
    timezone: payload?.timezone ?? null,
    currency: payload?.currency ?? null,
    settingsJson: payload?.settingsJson ?? null,
  };
};

const normalizeBranch = (
  payload: SuperAdminBranchResponse | null | undefined,
  fallbackRestaurantId?: number
): Branch => {
  const resolvedManagerUserId =
    payload?.managerUserId !== undefined && payload?.managerUserId !== null
      ? ensureNumber(payload.managerUserId)
      : payload?.adminUserId !== undefined && payload?.adminUserId !== null
      ? ensureNumber(payload.adminUserId)
      : null;

  return {
    id: ensureNumber(payload?.id ?? payload?.branchId),
    name: payload?.name ?? '',
    restaurantId: ensureNumber(payload?.restaurantId ?? fallbackRestaurantId ?? 0),
    adminUserId: resolvedManagerUserId,
    managerUserId: resolvedManagerUserId,
    managerUsername: payload?.managerUsername ?? null,
    managerEmail: payload?.managerEmail ?? null,
  };
};

const ensureRolePrefix = (role?: string | null): string => {
  if (!role) return 'ROLE_ADMIN';
  const upper = role.toUpperCase();
  if (ROLE_ALIAS_MAP[upper]) {
    return ROLE_ALIAS_MAP[upper];
  }
  if (upper.startsWith('ROLE_') && ROLE_ALIAS_MAP[upper.substring(5)]) {
    return ROLE_ALIAS_MAP[upper.substring(5)];
  }
  if (upper.startsWith('ROLE_')) {
    return upper;
  }
  return `ROLE_${upper}`;
};

const toUserRecord = (
  admin: {
    adminUserId?: number | null;
    userId?: number | null;
    username?: string | null;
    email?: string | null;
    role?: string | null;
    restaurantId?: number | null;
    branchId?: number | null;
    fullName?: string | null;
    phoneNumber?: string | null;
  }
): UserRecord => {
  const roleFromLookup = ensureRolePrefix(admin.role);
  const username = admin.username ?? null;
  const email = admin.email ?? username ?? null;
  const restaurantId = toNullableNumber(admin.restaurantId);
  const branchId = toNullableNumber(admin.branchId);
  const fullName = admin.fullName ?? username ?? null;
  return {
    id: admin.adminUserId ?? admin.userId ?? null,
    adminUserId: admin.adminUserId ?? admin.userId ?? null,
    adminEmail: email,
    username,
    email,
    role: roleFromLookup,
    restaurantId,
    branchId,
    assignedBranchId: branchId,
    fullName,
    phone: admin.phoneNumber ?? null,
  };
};

const toStaffRecord = (user: UserDto): UserRecord => {
  const normalizedRole = ensureRolePrefix(user.role);
  const email = user.email ?? user.username ?? null;
  const restaurantId = toNullableNumber(user.restaurantId);
  const branchId = toNullableNumber(user.branchId);
  return {
    id: user.id ?? null,
    username: user.username ?? null,
    email,
    role: normalizedRole,
    restaurantId,
    branchId,
  };
};

export const getRestaurant = async (api: AxiosInstance, restaurantId?: number) => {
  if (restaurantId) {
    try {
      const { data } = await api.get<Record<string, unknown>>(`/restaurants/${restaurantId}`);
      return normalizeRestaurant({
        restaurantId: toNullableNumber(data?.restaurantId) ?? restaurantId,
        id: toNullableNumber(data?.id),
        name: typeof data?.name === 'string' ? data.name : undefined,
        ownerUserId: toNullableNumber(data?.ownerUserId ?? data?.ownerSuperAdminId),
        ownerEmail: typeof data?.ownerEmail === 'string' ? data.ownerEmail : null,
        timezone: typeof data?.timezone === 'string' ? data.timezone : null,
        currency: typeof data?.currency === 'string' ? data.currency : null,
        settingsJson: typeof data?.settingsJson === 'string' ? data.settingsJson : null,
      });
    } catch (error) {
      console.warn('[api/superadmin] fallback to /superadmin/restaurant', error);
    }
  }

  const { data } = await api.get<SuperAdminRestaurantResponse>('/superadmin/restaurant');
  return normalizeRestaurant(data);
};

export const listBranches = async (api: AxiosInstance, restaurantId?: number) => {
  const { data } = await api.get<any>('/superadmin/branches');
  const rawBranches: SuperAdminBranchResponse[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.branches)
    ? data.branches
    : [];

  const normalized = rawBranches.map((branch) => normalizeBranch(branch, restaurantId));
  if (restaurantId === undefined || restaurantId === null) {
    return normalized;
  }
  return normalized.filter((branch) => branch.restaurantId === restaurantId);
};

export const createBranch = async (
  api: AxiosInstance,
  restaurantId: number,
  payload: BranchCreatePayload
) => {
  const body = {
    name: payload.name,
    restaurantId,
    managerUserId: payload.adminUserId ?? null,
  };
  const { data } = await api.post<SuperAdminBranchResponse>('/superadmin/branches', body);
  return normalizeBranch(data, restaurantId);
};

export const updateBranch = async (
  api: AxiosInstance,
  branchId: number,
  payload: BranchUpdatePayload,
  restaurantId?: number
) => {
  const body = {
    name: payload.name,
    restaurantId: restaurantId ?? undefined,
    managerUserId: payload.adminUserId ?? null,
  };
  const { data } = await api.put<SuperAdminBranchResponse>(
    `/superadmin/branches/${branchId}`,
    body
  );
  return normalizeBranch(data, restaurantId);
};

export const deleteBranch = async (api: AxiosInstance, branchId: number) => {
  await api.delete(`/superadmin/branches/${branchId}`);
};

export const assignAdminToBranch = async (
  api: AxiosInstance,
  branchId: number,
  adminUserId: number
) => {
  const { data } = await api.post<SuperAdminBranchResponse>(
    `/branches/${branchId}/assign-admin`,
    { adminUserId }
  );
  return normalizeBranch(data, undefined);
};

export const listAdminsForRestaurant = async (
  api: AxiosInstance,
  restaurantId?: number
) => {
  const { data } = await api.get<any>('/superadmin/admins');
  const rawAdmins: AdminSummaryResponse[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.admins)
    ? data.admins
    : [];

  const normalized = rawAdmins.map((admin) => toUserRecord(admin));
  if (restaurantId === undefined || restaurantId === null) {
    return normalized;
  }
  return normalized.filter((admin) => admin.restaurantId === restaurantId);
};

const sanitizeUsername = (value: string): string => {
  if (!value) {
    return '';
  }
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+/, '')
    .replace(/_+$/, '');
};

export const createAdmin = async (
  api: AxiosInstance,
  restaurantId: number,
  payload: AdminCreatePayload
) => {
  const email = payload.email.trim().toLowerCase();
  const password = payload.password.trim();
  const usernameCandidate = payload.fullName ? sanitizeUsername(payload.fullName) : undefined;
  const safeUsername = usernameCandidate && usernameCandidate.length > 0 ? usernameCandidate : undefined;

  const body: Record<string, unknown> = {
    email,
    username: email,
    password,
    role: 'BRANCH_MANAGER',
    restaurantId,
  };
  if (safeUsername) {
    body.username = safeUsername;
  }
  if (payload.branchId !== undefined && payload.branchId !== null) {
    body.branchId = payload.branchId;
  }

  const { data } = await api.post<SuperAdminUserResponse>('/superadmin/users', body);
  const record = toUserRecord({
    adminUserId: data.userId ?? null,
    username: data.username ?? null,
    email: data.email ?? null,
    role: data.role ?? null,
    restaurantId: data.restaurantId ?? null,
    branchId: data.branchId ?? null,
  });
  if (safeUsername && !record.username) {
    record.username = safeUsername;
  }
  if (payload.fullName) {
    record.fullName = payload.fullName;
  }
  if (payload.phoneNumber) {
    record.phone = payload.phoneNumber;
  }
  record.assignedBranchId = record.branchId ?? null;
  return record;
};

export const updateAdmin = async (
  api: AxiosInstance,
  username: string,
  payload: AdminUpdatePayload
) => {
  const body: Record<string, unknown> = {
    password: payload.password?.trim() || undefined,
  };
  if (payload.branchId !== undefined) {
    body.branchId = payload.branchId;
  }
  const normalizedUsername = username.toLowerCase();
  const { data } = await api.put<SuperAdminUserResponse>(
    `/superadmin/users/${encodeURIComponent(normalizedUsername)}`,
    body
  );
  return toUserRecord({
    adminUserId: data.userId ?? null,
    username: data.username ?? normalizedUsername,
    email: data.email ?? null,
    role: data.role ?? null,
    restaurantId: data.restaurantId ?? null,
    branchId: data.branchId ?? null,
  });
};

export const deleteAdmin = async (
  api: AxiosInstance,
  admin: {
    adminUserId?: number | null;
    username?: string | null;
    email?: string | null;
  }
) => {
  // Backend only supports username-based deletion: DELETE /api/superadmin/users/{username}
  // Prefer username, fallback to email
  const identifier = (admin.username?.trim() || admin.email?.trim()) || null;
  if (!identifier) {
    throw new Error(
      'Admin username or email is required to delete admin. ' +
      `Username: ${admin.username ?? 'null'}, Email: ${admin.email ?? 'null'}`
    );
  }
  const normalizedUsername = identifier.trim().toLowerCase();
  await api.delete(`/superadmin/users/${encodeURIComponent(normalizedUsername)}`);
};

export const listRestaurantStaff = async (
  api: AxiosInstance,
  restaurantId?: number
) => {
  const { data } = await api.get<UserDto[]>('/users');
  return (data ?? [])
    .map(toStaffRecord)
    .filter((user) => {
      const role = user.role.toUpperCase();
      if (role === 'ROLE_SUPERADMIN' || role === 'ROLE_ADMIN') return false;
      if (restaurantId !== undefined && restaurantId !== null) {
        return user.restaurantId === restaurantId;
      }
      return true;
    });
};

