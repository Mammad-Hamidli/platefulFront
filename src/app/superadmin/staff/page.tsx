'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { listBranches, listRestaurantStaff } from '@/lib/api/superadmin';
import type { Branch, UserRecord } from '@/types/entities';

interface StaffState {
  staff: UserRecord[];
  branches: Branch[];
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: StaffState = {
  staff: [],
  branches: [],
  loading: true,
  error: null,
};

export default function SuperadminStaffPage() {
  const { user } = useAuth();
  const api = useApi();
  const [state, setState] = useState<StaffState>(INITIAL_STATE);

  const restaurantId = user?.restaurantId ?? null;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!restaurantId) {
        setState({ staff: [], branches: [], loading: false, error: 'Restaurant assignment missing in JWT.' });
        return;
      }
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const [staff, branches] = await Promise.all([
          listRestaurantStaff(api, restaurantId),
          listBranches(api, restaurantId),
        ]);
        if (cancelled) return;
        setState({ staff, branches, loading: false, error: null });
      } catch (error) {
        console.error('[SuperadminStaff] load error', error);
        if (cancelled) return;
        setState({ staff: [], branches: [], loading: false, error: 'Failed to load staff.' });
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
  }, [api, restaurantId, user]);

  const branchLookup = useMemo(() => {
    const map = new Map<number, Branch>();
    state.branches.forEach((branch) => map.set(branch.id, branch));
    return map;
  }, [state.branches]);

  if (user?.role !== 'ROLE_SUPERADMIN') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900">
        Access restricted to SuperAdmin role.
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        Your JWT is missing the required restaurant identifier. Please contact support.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Staff directory</h1>
        <p className="text-sm text-slate-500">
          View-only listing of all staff members across your restaurant branches.
        </p>
      </header>

      {state.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      {state.loading ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          Loading staff directory…
        </div>
      ) : state.staff.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
          No staff found for this restaurant.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {state.staff.map((member) => {
                const branch = member.branchId ? branchLookup.get(member.branchId) : null;
                return (
                  <tr key={member.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{member.email}</td>
                    <td className="px-4 py-3">{member.role.replace('ROLE_', '')}</td>
                    <td className="px-4 py-3">{branch ? branch.name : 'Unassigned'}</td>
                    <td className="px-4 py-3">{member.phone ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
