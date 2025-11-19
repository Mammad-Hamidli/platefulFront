'use client';

import { useMemo } from 'react';
import { createApiClient } from '@/lib/api';
import { useAuth } from './useAuth';

export const useApi = () => {
  const { token, logout } = useAuth();

  return useMemo(
    () =>
      createApiClient(token ?? undefined, () => {
        void logout();
      }),
    [token, logout]
  );
};

