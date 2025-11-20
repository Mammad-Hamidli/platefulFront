'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { listMenuItems } from '@/lib/api/admin';
import type { MenuItem } from '@/types/entities';

export default function AdminMenuPage() {
  const { user } = useAuth();
  const api = useApi();

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  const restaurantId = user?.restaurantId ?? null;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!restaurantId) {
        setMenu([]);
        setLoading(false);
        setError('Your profile is missing a restaurant assignment.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await listMenuItems(api, restaurantId);
        if (!cancelled) {
          setMenu(data);
        }
      } catch (err) {
        console.error('[AdminMenu] load error', err);
        if (!cancelled) {
          setError('Failed to load menu items.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (user?.role === 'ROLE_ADMIN') {
      void load();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [api, restaurantId, user]);

  const filteredMenu = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return menu;
    return menu.filter(
      (item) =>
        item.name.toLowerCase().includes(normalized) ||
        (item.description ?? '').toLowerCase().includes(normalized) ||
        (item.category ?? '').toLowerCase().includes(normalized)
    );
  }, [menu, query]);

  if (user?.role !== 'ROLE_ADMIN') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900">
        Access restricted to Admin role.
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        Your administrator profile is missing a restaurant assignment. Please contact your
        SuperAdmin.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Menu</h1>
        <p className="text-sm text-slate-500">
          Review the current menu catalog configured by your SuperAdmin. Menu items are read-only.
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Menu items</h2>
            <p className="text-xs text-slate-500">
              {menu.length} {menu.length === 1 ? 'item' : 'items'} available
            </p>
          </div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none sm:w-64"
            placeholder="Search by name or category…"
          />
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading menu items…</p>
        ) : filteredMenu.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No menu items match your search.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMenu.map((item) => (
              <li key={item.id} className="rounded-lg border border-slate-200 px-3 py-2 shadow-sm">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
                  <span className="text-xs font-medium text-slate-500">
                    ${(item.priceCents ?? 0) / 100}
                  </span>
                </div>
                {item.category ? (
                  <p className="mt-1 text-xs uppercase tracking-wide text-blue-600">
                    {item.category}
                  </p>
                ) : null}
                {item.description ? (
                  <p className="mt-2 text-xs text-slate-600">{item.description}</p>
                ) : null}
                <p className="mt-2 text-[11px] font-medium text-slate-500">
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

