import type { AuthUser } from '@/types/auth';
import { normalizeUserRole } from './roles';
import type { TokenClaims } from './token';

const coerceNumber = (value: unknown, fallback: number | null = null): number | null => {
  if (value === undefined || value === null) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const resolveRole = (value?: string | null) => normalizeUserRole(value ?? undefined);

const ensurePermissions = (permissions: unknown): string[] =>
  Array.isArray(permissions) ? permissions.map(String) : [];

export const applyClaimsToUser = (user: AuthUser, claims: TokenClaims) => {
  if (!user || !claims) return;
  const claimRole = resolveRole(claims.role ?? null);
  if (claimRole) {
    user.role = claimRole;
  }
  const restaurantId = coerceNumber(claims.restaurantId);
  if (restaurantId !== null) {
    user.restaurantId = restaurantId;
  }
  const branchId = coerceNumber(claims.branchId, null);
  if (branchId !== null || claims.branchId === null) {
    user.branchId = branchId;
  }
  if (claims.email) {
    user.email = claims.email;
  }
  if (claims.restaurantName !== undefined) {
    user.restaurantName = claims.restaurantName ?? null;
  }
  if (claims.permissions) {
    user.permissions = ensurePermissions(claims.permissions);
  }
  if (!user.id && claims.userId) {
    user.id = Number(claims.userId);
  }
};

export const buildUserFromClaims = (claims: TokenClaims): AuthUser | undefined => {
  if (!claims) return undefined;
  const role = resolveRole(claims.role ?? null);
  if (!role) return undefined;
  return {
    id: coerceNumber(claims.userId, 0) ?? 0,
    email: claims.email ?? '',
    role,
    restaurantId: coerceNumber(claims.restaurantId, 0) ?? 0,
    branchId: coerceNumber(claims.branchId, null),
    restaurantName: claims.restaurantName ?? null,
    permissions: ensurePermissions(claims.permissions),
  };
};

export const buildAuthUser = (payload: any, claims?: TokenClaims): AuthUser | undefined => {
  if (!payload && !claims) return undefined;
  let user: AuthUser | undefined;

  if (payload) {
    const role = resolveRole(
      payload.role ??
        payload.authority ??
        payload.authorities?.[0]?.authority ??
        payload.authorities?.[0]?.role
    );
    if (role) {
      user = {
        id: Number(payload.id ?? payload.userId ?? payload.user?.id ?? 0),
        email: payload.email ?? payload.username ?? payload.user?.email ?? '',
        role,
        restaurantId:
          Number(payload.restaurantId ?? payload.restaurant?.id ?? payload.user?.restaurantId ?? 0) || 0,
        branchId:
          coerceNumber(
            payload.branchId ??
              payload.branch?.id ??
              payload.user?.branchId ??
              payload.user?.branch?.id,
            null
          ),
        restaurantName: payload.restaurantName ?? payload.restaurant?.name ?? null,
        permissions: ensurePermissions(payload.permissions),
      };
    }
  }

  if (!user && claims) {
    user = buildUserFromClaims(claims);
  }

  if (user && claims) {
    applyClaimsToUser(user, claims);
  }

  if (user) {
    user.permissions = Array.isArray(user.permissions) ? user.permissions : [];
  }

  return user;
};

