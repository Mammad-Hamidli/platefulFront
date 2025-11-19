'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const NAV_LINKS: Record<
  'ROLE_SUPERADMIN' | 'ROLE_ADMIN' | 'ROLE_WAITER',
  { label: string; href: string }[]
> = {
  ROLE_SUPERADMIN: [
    { label: 'Overview', href: '/dashboard/superadmin' },
    { label: 'Restaurants', href: '/dashboard/superadmin#restaurants' },
    { label: 'Admins', href: '/dashboard/superadmin#admins' },
    { label: 'Branches', href: '/dashboard/superadmin#branches' },
  ],
  ROLE_ADMIN: [
    { label: 'Overview', href: '/dashboard/admin' },
    { label: 'Branches', href: '/dashboard/admin#branches' },
    { label: 'Menu', href: '/dashboard/admin#menu' },
    { label: 'Tables', href: '/dashboard/admin#tables' },
    { label: 'Waiters', href: '/dashboard/admin#waiters' },
  ],
  ROLE_WAITER: [],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const links = NAV_LINKS[user.role] ?? [];

  return (
    <aside className="flex w-72 flex-col gap-6 border-r border-slate-200 bg-white px-4 py-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">Signed in as</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{user.username}</p>
        <p className="text-sm capitalize text-slate-500">
          {user.role.replace('ROLE_', '').toLowerCase()}
        </p>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const active = pathname === link.href.split('#')[0];
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                active
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => logout()}
        className="mt-auto rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        Sign out
      </button>
    </aside>
  );
}

