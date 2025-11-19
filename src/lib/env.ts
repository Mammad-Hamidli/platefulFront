export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:8080/api';

import type { UserRole } from '@/types/auth';
import { rolePathMap } from './roles';

export const DASHBOARD_REDIRECTS: Record<UserRole, string> = rolePathMap;

