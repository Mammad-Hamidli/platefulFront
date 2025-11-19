import type { UserRole } from '@/types/auth';

const ROLE_MAP: Record<string, UserRole> = {
  ROLE_SUPERADMIN: 'ROLE_SUPERADMIN',
  ROLE_ADMIN: 'ROLE_ADMIN',
  ROLE_WAITER: 'ROLE_WAITER',
  SUPERADMIN: 'ROLE_SUPERADMIN',
  ADMIN: 'ROLE_ADMIN',
  WAITER: 'ROLE_WAITER',
};

export const normalizeUserRole = (role?: string | null): UserRole | undefined => {
  if (!role) return undefined;
  const key = role.toUpperCase();
  return ROLE_MAP[key];
};

export const rolePathMap: Record<UserRole, string> = {
  ROLE_SUPERADMIN: '/dashboard/superadmin',
  ROLE_ADMIN: '/dashboard/admin',
  ROLE_WAITER: '/login',
};

