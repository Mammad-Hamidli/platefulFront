import type { AuthUser } from '@/types/auth';
import { normalizeUserRole } from './roles';

export const buildAuthUser = (payload: any): AuthUser | undefined => {
  if (!payload) return undefined;
  const role = normalizeUserRole(
    payload.role ??
      payload.authority ??
      payload.authorities?.[0]?.authority ??
      payload.authorities?.[0]?.role
  );
  if (!role) return undefined;

  return {
    id: Number(payload.id ?? payload.userId ?? payload.user?.id ?? 0),
    username: payload.username ?? payload.email ?? payload.user?.username ?? '',
    email: payload.email ?? payload.user?.email,
    role,
    restaurantId:
      payload.restaurantId ??
      payload.restaurant?.id ??
      payload.user?.restaurantId ??
      payload.user?.restaurant?.id ??
      null,
    branchId:
      payload.branchId ??
      payload.branch?.id ??
      payload.user?.branchId ??
      payload.user?.branch?.id ??
      null,
  };
};

