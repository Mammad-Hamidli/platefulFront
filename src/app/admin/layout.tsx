'use client';

import { ProtectedLayout } from '@/components/dashboard/ProtectedLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout allowedRoles={['ROLE_ADMIN']}>{children}</ProtectedLayout>;
}

