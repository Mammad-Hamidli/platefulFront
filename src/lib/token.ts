export interface TokenClaims {
  userId?: number | null;
  role?: string | null;
  restaurantId?: number | null;
  branchId?: number | null;
  email?: string | null;
  restaurantName?: string | null;
  permissions?: string[] | null;
}

const decodeBase64Url = (value: string): string => {
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    if (typeof window === 'undefined') {
      return Buffer.from(base64, 'base64').toString('utf8');
    }
    // Browser
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
  } catch {
    return '';
  }
};

export const parseJwt = (token?: string | null): TokenClaims => {
  if (!token) return {};
  const parts = token.split('.');
  if (parts.length < 2) return {};
  const payloadRaw = decodeBase64Url(parts[1]);
  if (!payloadRaw) return {};
  try {
    const payload = JSON.parse(payloadRaw);
    return {
      userId: payload.userId ?? payload.sub ?? payload.id ?? null,
      role: payload.role ?? payload.authority ?? null,
      restaurantId: payload.restaurantId ?? payload.restId ?? null,
      branchId: payload.branchId ?? null,
      email: payload.email ?? payload.username ?? null,
      restaurantName: payload.restaurantName ?? null,
      permissions: Array.isArray(payload.permissions) ? payload.permissions : undefined,
    };
  } catch (error) {
    console.error('[token] Unable to parse JWT payload', error);
    return {};
  }
};

