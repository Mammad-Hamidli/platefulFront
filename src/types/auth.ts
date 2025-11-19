export type UserRole = 'ROLE_SUPERADMIN' | 'ROLE_ADMIN' | 'ROLE_WAITER';

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  email?: string;
  restaurantId?: number | null;
  branchId?: number | null;
}

export interface AuthSession {
  token: string | null;
  user: AuthUser | null;
}

