'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { getRestaurant, listBranches } from '@/lib/api/superadmin';
import type { Branch, Restaurant } from '@/types/entities';

interface DashboardState {
  restaurant: Restaurant | null;
  branches: Branch[];
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: DashboardState = {
  restaurant: null,
  branches: [],
  loading: true,
  error: null,
};

export default function SuperadminDashboardPage() {
  const { user } = useAuth();
  const api = useApi();
  const [state, setState] = useState<DashboardState>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user?.restaurantId) {
        setState({ restaurant: null, branches: [], loading: false, error: 'Restaurant assignment missing in token.' });
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const [restaurant, branches] = await Promise.all([
          getRestaurant(api, user.restaurantId),
          listBranches(api, user.restaurantId),
        ]);
        if (cancelled) return;
        setState({ restaurant, branches, loading: false, error: null });
      } catch (error) {
        console.error('[SuperadminDashboard] load error', error);
        if (cancelled) return;
        setState({ restaurant: null, branches: [], loading: false, error: 'Failed to load restaurant information.' });
      }
    };

    if (user?.role === 'ROLE_SUPERADMIN') {
      void load();
    } else {
      setState(INITIAL_STATE);
    }

    return () => {
      cancelled = true;
    };
  }, [api, user]);

  if (user?.role !== 'ROLE_SUPERADMIN') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900">
        Access restricted to SuperAdmin role.
      </div>
    );
  }

  if (!user.restaurantId) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        Your JWT is missing the required restaurant identifier. Please contact support.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Restaurant overview</h1>
        <p className="text-sm text-slate-500">
          You are managing a single restaurant tenant. All data shown belongs to that restaurant only.
        </p>
      </header>

      {state.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      {state.loading ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          Loading restaurant information…
        </div>
      ) : state.restaurant ? (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900">{state.restaurant.name}</h2>
              <dl className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Owner SuperAdmin ID</dt>
                  <dd className="mt-1 text-base text-slate-900">{state.restaurant.ownerSuperAdminId}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Timezone</dt>
                  <dd className="mt-1 text-base text-slate-900">{state.restaurant.timezone ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Currency</dt>
                  <dd className="mt-1 text-base text-slate-900">{state.restaurant.currency ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Settings JSON</dt>
                  <dd className="mt-1 break-words text-xs text-slate-500">
                    {state.restaurant.settingsJson ? state.restaurant.settingsJson.slice(0, 120) + (state.restaurant.settingsJson.length > 120 ? '…' : '') : '—'}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              <p className="text-xs uppercase tracking-wide text-slate-400">Branches</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{state.branches.length}</p>
              <p className="mt-1 text-xs text-slate-500">
                {state.branches.length === 1
                  ? 'There is 1 branch linked to this restaurant.'
                  : `There are ${state.branches.length} branches linked to this restaurant.`}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          Restaurant information is not available.
        </div>
      )}
    </div>
  );
}

