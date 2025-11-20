import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const DASHBOARD_MAP: Record<string, string> = {
  ROLE_SUPERADMIN: '/superadmin/dashboard',
  ROLE_ADMIN: '/admin/dashboard',
};

export default function DashboardIndex() {
  const role = cookies().get('role')?.value ?? 'ROLE_ADMIN';
  redirect(DASHBOARD_MAP[role] ?? '/admin/dashboard');
}

