'use client';

import { ProtectedLayout } from '@/components/dashboard/ProtectedLayout';
import type { UserRole } from '@/types/auth';

const ALLOWED_ROLES: UserRole[] = ['ROLE_SUPERADMIN', 'ROLE_ADMIN'];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout allowedRoles={ALLOWED_ROLES}>{children}</ProtectedLayout>;
}

