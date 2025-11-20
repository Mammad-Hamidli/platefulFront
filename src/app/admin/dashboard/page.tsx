'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { getBranch, listMenuItems, listStaff, listTables } from '@/lib/api/admin';
import type { Branch, MenuItem, TableEntity, UserRecord } from '@/types/entities';

interface DashboardState {
  branch: Branch | null;
  staff: UserRecord[];
  tables: TableEntity[];
  menu: MenuItem[];
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: DashboardState = {
  branch: null,
  staff: [],
  tables: [],
  menu: [],
  loading: true,
  error: null,
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const api = useApi();
  const [state, setState] = useState<DashboardState>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user?.branchId || !user.restaurantId) {
        setState({
          branch: null,
          staff: [],
          tables: [],
          menu: [],
          loading: false,
          error: 'Your account is missing branch or restaurant assignments.',
        });
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const [branch, staff, tables, menu] = await Promise.all([
          getBranch(api, user.branchId),
          listStaff(api, user.branchId),
          listTables(api, user.restaurantId, user.branchId),
          listMenuItems(api, user.restaurantId),
        ]);

        if (cancelled) return;

        setState({
          branch,
          staff,
          tables,
          menu,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('[AdminDashboard] load error', err);
        if (!cancelled) {
          setState({
            branch: null,
            staff: [],
            tables: [],
            menu: [],
            loading: false,
            error: 'Failed to load branch information.',
          });
        }
      }
    };

    if (user?.role === 'ROLE_ADMIN') {
      void load();
    } else {
      setState(INITIAL_STATE);
    }

    return () => {
      cancelled = true;
    };
  }, [api, user]);

  const stats = useMemo(
    () => ({
      staffCount: state.staff.length,
      tableCount: state.tables.length,
      activeTables: state.tables.filter((table) => table.active).length,
      menuCount: state.menu.length,
    }),
    [state.staff, state.tables, state.menu]
  );

  if (user?.role !== 'ROLE_ADMIN') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900">
        Access restricted to Admin role.
      </div>
    );
  }

  if (!user.branchId || !user.restaurantId) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        Your administrator profile is missing a branch assignment. Please contact your SuperAdmin.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Branch overview</h1>
        <p className="text-sm text-slate-500">
          Review key details for your assigned branch. All metrics are scoped to your branch only.
        </p>
      </header>

      {state.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Staff members" value={stats.staffCount} loading={state.loading} />
        <StatCard label="Tables" value={stats.tableCount} loading={state.loading} />
        <StatCard label="Active tables" value={stats.activeTables} loading={state.loading} />
        <StatCard label="Menu items" value={stats.menuCount} loading={state.loading} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Branch details</h2>
        {state.loading ? (
          <p className="mt-3 text-sm text-slate-500">Loading branch information…</p>
        ) : state.branch ? (
          <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Branch name</dt>
              <dd className="mt-1 text-base text-slate-900">{state.branch.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Branch ID</dt>
              <dd className="mt-1 text-base text-slate-900">{state.branch.id}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Restaurant ID</dt>
              <dd className="mt-1 text-base text-slate-900">{state.branch.restaurantId}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Assigned admin ID</dt>
              <dd className="mt-1 text-base text-slate-900">{state.branch.adminUserId ?? 'You'}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            Branch data could not be loaded. Try refreshing the page.
          </p>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Staff</h2>
          {state.loading ? (
            <p className="mt-3 text-sm text-slate-500">Loading staff records…</p>
          ) : state.staff.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No staff registered yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {state.staff.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                >
                  <span>{member.email}</span>
                  <span className="text-xs uppercase text-slate-400">
                    {member.role.replace('ROLE_', '')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Tables</h2>
          {state.loading ? (
            <p className="mt-3 text-sm text-slate-500">Loading tables…</p>
          ) : state.tables.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              No tables registered. Create tables to start seating guests.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {state.tables.map((table) => (
                <li
                  key={table.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      Table {table.tableNumber ?? table.id}
                    </p>
                    <p className="text-xs text-slate-500">
                      Seats {table.seatCount ?? 'N/A'} • {table.active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Menu preview</h2>
        {state.loading ? (
          <p className="mt-3 text-sm text-slate-500">Loading menu items…</p>
        ) : state.menu.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No menu items available. Menu changes are managed by the SuperAdmin.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {state.menu.slice(0, 6).map((item) => (
              <li key={item.id} className="rounded-lg border border-slate-100 px-3 py-2">
                <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">
                  {(item.priceCents ?? 0) / 100} • {item.isAvailable ? 'Available' : 'Unavailable'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  loading: boolean;
}

function StatCard({ label, value, loading }: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">
        {loading ? <span className="text-base font-medium text-slate-400">Loading…</span> : value}
      </p>
    </div>
  );
}

