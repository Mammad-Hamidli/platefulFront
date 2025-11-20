'use client';

import { ProtectedLayout } from '@/components/dashboard/ProtectedLayout';

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout allowedRoles={['ROLE_SUPERADMIN']}>{children}</ProtectedLayout>;
}

