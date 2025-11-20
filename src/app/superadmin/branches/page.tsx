'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import {
  createBranch,
  deleteBranch,
  listAdminsForRestaurant,
  listBranches,
  updateBranch,
} from '@/lib/api/superadmin';
import type { Branch, UserRecord } from '@/types/entities';

interface BranchFormState {
  name: string;
  adminUserId: string;
}

const EMPTY_FORM: BranchFormState = {
  name: '',
  adminUserId: '',
};

interface BranchState {
  branches: Branch[];
  admins: UserRecord[];
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: BranchState = {
  branches: [],
  admins: [],
  loading: true,
  error: null,
};

export default function SuperadminBranchesPage() {
  const { user } = useAuth();
  const api = useApi();
  const [state, setState] = useState<BranchState>(INITIAL_STATE);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<BranchFormState>(EMPTY_FORM);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editForm, setEditForm] = useState<BranchFormState>(EMPTY_FORM);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const restaurantId = user?.restaurantId ?? null;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!restaurantId) {
        setState({
          branches: [],
          admins: [],
          loading: false,
          error: 'Restaurant assignment missing in JWT.',
        });
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const [branches, admins] = await Promise.all([
          listBranches(api, restaurantId),
          listAdminsForRestaurant(api, restaurantId),
        ]);
        if (cancelled) return;
        setState({ branches, admins, loading: false, error: null });
      } catch (error) {
        console.error('[SuperadminBranches] load error', error);
        if (cancelled) return;
        setState({ branches: [], admins: [], loading: false, error: 'Failed to load branches.' });
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

  const adminLookup = useMemo(() => {
    const map = new Map<number, UserRecord>();
    state.admins.forEach((admin) => map.set(admin.id, admin));
    return map;
  }, [state.admins]);

  const resetCreateForm = () => setCreateForm(EMPTY_FORM);
  const resetEditForm = () => {
    setEditingBranch(null);
    setEditForm(EMPTY_FORM);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!restaurantId) return;
    setCreateSubmitting(true);
    setState((prev) => ({ ...prev, error: null }));
    try {
      const branch = await createBranch(api, restaurantId, {
        name: createForm.name.trim(),
        adminUserId: createForm.adminUserId ? Number(createForm.adminUserId) : null,
      });
      setState((prev) => ({
        ...prev,
        branches: [branch, ...prev.branches],
      }));
      resetCreateForm();
      setShowCreate(false);
    } catch (error) {
      console.error('[SuperadminBranches] create error', error);
      setState((prev) => ({ ...prev, error: 'Failed to create branch. Please try again.' }));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setEditForm({
      name: branch.name ?? '',
      adminUserId: branch.adminUserId ? String(branch.adminUserId) : '',
    });
  };

  const handleEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingBranch) return;
    setEditSubmitting(true);
    setState((prev) => ({ ...prev, error: null }));
    try {
      const updated = await updateBranch(api, editingBranch.id, {
        name: editForm.name.trim(),
        adminUserId: editForm.adminUserId ? Number(editForm.adminUserId) : null,
      });
      setState((prev) => ({
        ...prev,
        branches: prev.branches.map((branch) => (branch.id === updated.id ? updated : branch)),
      }));
      resetEditForm();
    } catch (error) {
      console.error('[SuperadminBranches] update error', error);
      setState((prev) => ({ ...prev, error: 'Failed to update branch.' }));
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (branchId: number) => {
    if (!confirm('Delete this branch? This action cannot be undone.')) {
      return;
    }
    setState((prev) => ({ ...prev, error: null }));
    try {
      await deleteBranch(api, branchId);
      setState((prev) => ({
        ...prev,
        branches: prev.branches.filter((branch) => branch.id !== branchId),
      }));
      if (editingBranch?.id === branchId) {
        resetEditForm();
      }
    } catch (error) {
      console.error('[SuperadminBranches] delete error', error);
      setState((prev) => ({ ...prev, error: 'Failed to delete branch.' }));
    }
  };

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
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Branches</h1>
          <p className="text-sm text-slate-500">
            Create and manage the branches belonging to your restaurant tenant.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          onClick={() => {
            resetCreateForm();
            setShowCreate(true);
          }}
        >
          + Create branch
        </button>
      </header>

      {state.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      {state.loading ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          Loading branches…
        </div>
      ) : state.branches.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
          No branches found. Create your first branch to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {state.branches.map((branch) => {
            const admin = branch.adminUserId ? adminLookup.get(branch.adminUserId) : null;
            return (
              <article
                key={branch.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{branch.name}</h2>
                    <div className="mt-1 text-xs text-slate-500">Branch ID: {branch.id}</div>
                    <dl className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-400">
                          Assigned admin
                        </dt>
                        <dd className="mt-1 text-base text-slate-900">
                          {admin ? admin.email : 'Unassigned'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="flex gap-2 text-xs font-medium text-slate-600">
                    <button
                      type="button"
                      onClick={() => openEditModal(branch)}
                      className="inline-flex items-center rounded-lg border border-blue-200 px-3 py-1 text-blue-600 transition hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(branch.id)}
                      className="inline-flex items-center rounded-lg border border-red-200 px-3 py-1 text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        title="Create branch"
        open={showCreate}
        onClose={() => {
          if (!createSubmitting) {
            setShowCreate(false);
            resetCreateForm();
          }
        }}
      >
        <form className="space-y-4" onSubmit={handleCreate}>
          <BranchForm
            form={createForm}
            admins={state.admins}
            disabled={createSubmitting}
            onChange={setCreateForm}
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              onClick={() => {
                resetCreateForm();
                setShowCreate(false);
              }}
              disabled={createSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createSubmitting ? 'Creating…' : 'Create branch'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title={editingBranch ? `Edit ${editingBranch.name}` : 'Edit branch'}
        open={Boolean(editingBranch)}
        onClose={() => {
          if (!editSubmitting) resetEditForm();
        }}
      >
        <form className="space-y-4" onSubmit={handleEdit}>
          <BranchForm
            form={editForm}
            admins={state.admins}
            disabled={editSubmitting}
            onChange={setEditForm}
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              onClick={() => {
                if (!editSubmitting) resetEditForm();
              }}
              disabled={editSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editSubmitting ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ title, open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

interface BranchFormProps {
  form: BranchFormState;
  admins: UserRecord[];
  disabled?: boolean;
  onChange: (form: BranchFormState) => void;
}

function BranchForm({ form, admins, disabled, onChange }: BranchFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600" htmlFor="branch-name">
          Branch name
        </label>
        <input
          id="branch-name"
          required
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="Downtown"
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600" htmlFor="branch-admin">
          Assign admin (optional)
        </label>
        <select
          id="branch-admin"
          value={form.adminUserId}
          onChange={(event) => onChange({ ...form, adminUserId: event.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          disabled={disabled}
        >
          <option value="">Unassigned</option>
          {admins.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.email}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
