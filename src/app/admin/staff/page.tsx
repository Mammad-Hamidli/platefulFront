'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { createStaff, deleteStaff, listStaff, updateStaff } from '@/lib/api/admin';
import type { UserRecord } from '@/types/entities';

type StaffRole = 'ROLE_WAITER' | 'ROLE_KITCHEN';

const ROLE_OPTIONS: { label: string; value: StaffRole }[] = [
  { label: 'Waiter', value: 'ROLE_WAITER' },
  { label: 'Kitchen', value: 'ROLE_KITCHEN' },
];

interface CreateStaffForm {
  email: string;
  password: string;
  role: StaffRole;
}

interface EditStaffForm {
  role: StaffRole;
  password: string;
}

const INITIAL_CREATE_FORM: CreateStaffForm = {
  email: '',
  password: '',
  role: 'ROLE_WAITER',
};

const INITIAL_EDIT_FORM: EditStaffForm = {
  role: 'ROLE_WAITER',
  password: '',
};

const ROLE_LABEL: Record<StaffRole, string> = {
  ROLE_WAITER: 'Waiter',
  ROLE_KITCHEN: 'Kitchen',
};

const formatRole = (role: string) =>
  ROLE_LABEL[role as StaffRole] ?? role.replace('ROLE_', '').toLowerCase();

export default function AdminStaffPage() {
  const { user } = useAuth();
  const api = useApi();

  const [staff, setStaff] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<CreateStaffForm>(INITIAL_CREATE_FORM);
  const [creating, setCreating] = useState(false);

  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditStaffForm>(INITIAL_EDIT_FORM);
  const [saving, setSaving] = useState(false);

  const branchId = user?.branchId ?? null;
  const restaurantId = user?.restaurantId ?? null;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!branchId) {
        setStaff([]);
        setLoading(false);
        setError('Your profile is missing a branch assignment.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await listStaff(api, branchId);
        if (!cancelled) {
          setStaff(data);
        }
      } catch (err) {
        console.error('[AdminStaff] load error', err);
        if (!cancelled) {
          setError('Failed to load staff list.');
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
  }, [api, branchId, user]);

  const refreshStaff = async () => {
    if (!branchId) return;
    try {
      const data = await listStaff(api, branchId);
      setStaff(data);
    } catch (err) {
      console.error('[AdminStaff] refresh error', err);
      setError('Failed to refresh staff list.');
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!restaurantId || !branchId) return;
    setCreating(true);
    setError(null);
    try {
      const email = createForm.email.trim().toLowerCase();
      if (!email) {
        throw new Error('Email is required');
      }
      const password = createForm.password.trim();
      await createStaff(api, restaurantId, branchId, {
        email,
        role: createForm.role,
        password: password ? password : undefined,
      });
      setCreateForm(INITIAL_CREATE_FORM);
      await refreshStaff();
    } catch (err) {
      console.error('[AdminStaff] create error', err);
      setError(err instanceof Error ? err.message : 'Failed to create staff member.');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (member: UserRecord) => {
    setEditingEmail(member.email);
    setEditForm({
      role: ROLE_LABEL[member.role as StaffRole] ? (member.role as StaffRole) : 'ROLE_WAITER',
      password: '',
    });
  };

  const cancelEdit = () => {
    setEditingEmail(null);
    setEditForm(INITIAL_EDIT_FORM);
  };

  const handleEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingEmail) return;
    setSaving(true);
    setError(null);
    try {
      const password = editForm.password.trim();
      await updateStaff(api, editingEmail, {
        role: editForm.role,
        password: password ? password : undefined,
      });
      cancelEdit();
      await refreshStaff();
    } catch (err) {
      console.error('[AdminStaff] update error', err);
      setError('Failed to update staff member.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (email: string) => {
    if (!confirm('Remove this staff member?')) return;
    setError(null);
    try {
      await deleteStaff(api, email);
      await refreshStaff();
    } catch (err) {
      console.error('[AdminStaff] delete error', err);
      setError('Failed to delete staff member.');
    }
  };

  const staffCount = useMemo(() => staff.length, [staff]);

  if (user?.role !== 'ROLE_ADMIN') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900">
        Access restricted to Admin role.
      </div>
    );
  }

  if (!branchId || !restaurantId) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        Your administrator profile is missing branch or restaurant assignments. Please contact your
        SuperAdmin.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Branch staff</h1>
        <p className="text-sm text-slate-500">
          Recruit, update, and remove staff members assigned to your branch.
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Add staff member</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>
          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="staff-email">
              Email
            </label>
            <input
              id="staff-email"
              type="email"
              required
              value={createForm.email}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, email: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="waiter@restaurant.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="staff-role">
              Role
            </label>
            <select
              id="staff-role"
              value={createForm.role}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, role: event.target.value as StaffRole }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600" htmlFor="staff-password">
              Temporary password (optional)
            </label>
            <input
              id="staff-password"
              type="text"
              value={createForm.password}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, password: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Leave empty to auto-generate"
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? 'Adding…' : 'Add staff member'}
            </button>
            <button
              type="button"
              onClick={() => setCreateForm(INITIAL_CREATE_FORM)}
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
              disabled={creating}
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Current staff</h2>
          <span className="text-xs font-medium text-slate-500">
            {staffCount} {staffCount === 1 ? 'member' : 'members'}
          </span>
        </div>

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            Loading staff members…
          </div>
        ) : staff.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
            No staff members found for this branch.
          </div>
        ) : (
          <div className="space-y-4">
            {staff.map((member) =>
              editingEmail === member.email ? (
                <form
                  key={member.email}
                  className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                  onSubmit={handleEdit}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-blue-900">{member.email}</h3>
                      <p className="text-xs text-blue-700">User ID: {member.id}</p>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-medium text-blue-700 hover:text-blue-900"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-blue-800" htmlFor="edit-role">
                        Role
                      </label>
                      <select
                        id="edit-role"
                        value={editForm.role}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, role: event.target.value as StaffRole }))
                        }
                        className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-blue-800"
                        htmlFor="edit-password"
                      >
                        Reset password (optional)
                      </label>
                      <input
                        id="edit-password"
                        type="text"
                        value={editForm.password}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, password: event.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        placeholder="Leave empty to keep current password"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <article
                  key={member.email}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{member.email}</h3>
                    <p className="text-xs text-slate-500">Role: {formatRole(member.role)}</p>
                  </div>
                  <div className="flex gap-2 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => startEdit(member)}
                      className="inline-flex items-center rounded-lg border border-blue-200 px-3 py-1 text-blue-600 transition hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(member.email)}
                      className="inline-flex items-center rounded-lg border border-red-200 px-3 py-1 text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}

