'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthSession, AuthUser, UserRole } from '@/types/auth';
import { DASHBOARD_REDIRECTS } from '@/lib/env';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const roleToPath = (role: UserRole) => DASHBOARD_REDIRECTS[role] ?? '/admin/dashboard';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const handleSessionResponse = useCallback((session: AuthSession) => {
    if (!session || !session.user || !session.token) {
      setUser(null);
      setToken(null);
      return;
    }

    if (session.user.role === 'ROLE_WAITER') {
      setUser(null);
      setToken(null);
      return;
    }

    const normalizedUser: AuthUser = {
      ...session.user,
      permissions: Array.isArray(session.user.permissions) ? session.user.permissions : [],
    };

    setUser(normalizedUser);
    setToken(session.token);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch session');
      }
      const data: AuthSession = await res.json();
      handleSessionResponse(data);
    } catch (error) {
      console.error('[Auth] session error', error);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [handleSessionResponse]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (res.status === 403) {
        const body = await res.json();
        throw new Error(body?.message ?? 'Login restricted for this role');
      }

      if (!res.ok) {
        const body = await res.json().catch(() => undefined);
        throw new Error(body?.message ?? 'Login failed');
      }

      const data: AuthSession = await res.json();
      if (!data.user || !data.token) {
        throw new Error('Invalid login response');
      }

      if (data.user.role === 'ROLE_WAITER') {
        throw new Error('Login not permitted for this role.');
      }

      handleSessionResponse(data);
      router.replace(roleToPath(data.user.role));
      return data.user;
    },
    [handleSessionResponse, router]
  );

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setToken(null);
    router.replace('/login');
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      refreshSession,
    }),
    [user, token, loading, login, logout, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
};

