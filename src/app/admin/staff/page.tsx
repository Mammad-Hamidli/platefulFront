'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { createStaff, deleteStaff, listStaff, updateStaff } from '@/lib/api/admin';
import type { UserRecord } from '@/types/entities';

// Staff roles that admins can create/manage (ROLE_ADMIN is NOT allowed)
type StaffRole = 'ROLE_WAITER' | 'ROLE_KITCHEN' | 'ROLE_CASHIER';

const ROLE_OPTIONS: { label: string; value: StaffRole }[] = [
  { label: 'Waiter', value: 'ROLE_WAITER' },
  { label: 'Kitchen', value: 'ROLE_KITCHEN' },
  { label: 'Cashier', value: 'ROLE_CASHIER' },
];

// Salary period options
const SALARY_PERIOD_OPTIONS: { label: string; value: 'DAILY' | 'WEEKLY' | 'MONTHLY' }[] = [
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
];

interface CreateStaffForm {
  username: string; // Required - backend expects username
  role: StaffRole; // Must be ROLE_WAITER, ROLE_KITCHEN, or ROLE_CASHIER (NOT ROLE_ADMIN)
  email?: string; // Optional - will be auto-generated if not provided
  phoneNumber: string; // Required - staff phone number
  salaryAmount: string; // Required - staff salary amount (as string for input)
  salaryPeriod: 'DAILY' | 'WEEKLY' | 'MONTHLY'; // Required - staff salary period
}

interface EditStaffForm {
  role: StaffRole; // Must be ROLE_WAITER, ROLE_KITCHEN, or ROLE_CASHIER (NOT ROLE_ADMIN)
  phoneNumber: string; // Required - staff phone number
  salaryAmount: string; // Required - staff salary amount (as string for input)
  salaryPeriod: 'DAILY' | 'WEEKLY' | 'MONTHLY'; // Required - staff salary period
}

const INITIAL_CREATE_FORM: CreateStaffForm = {
  username: '',
  role: 'ROLE_WAITER',
  email: '',
  phoneNumber: '',
  salaryAmount: '',
  salaryPeriod: 'MONTHLY',
};

const INITIAL_EDIT_FORM: EditStaffForm = {
  role: 'ROLE_WAITER',
  phoneNumber: '',
  salaryAmount: '',
  salaryPeriod: 'MONTHLY',
};

const ROLE_LABEL: Record<StaffRole | string, string> = {
  ROLE_WAITER: 'Waiter',
  ROLE_KITCHEN: 'Kitchen',
  ROLE_CASHIER: 'Cashier',
  ROLE_ADMIN: 'Admin', // For display only (should not appear in forms)
};

const formatRole = (role: string) =>
  ROLE_LABEL[role] ?? role.replace('ROLE_', '').toLowerCase();

// Simple toast notification system
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  // Create a simple toast element
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
    type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
};

export default function AdminStaffPage() {
  const { user } = useAuth();
  const api = useApi();

  const [staff, setStaff] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
          console.log('[AdminStaff] load success', { count: data.length });
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
    setSuccessMessage(null);
    
    try {
      // Validate required fields
      const username = createForm.username.trim();
      if (!username) {
        throw new Error('Username is required');
      }
      
      const phoneNumber = createForm.phoneNumber.trim();
      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }
      
      const salaryAmount = parseFloat(createForm.salaryAmount);
      if (!createForm.salaryAmount || isNaN(salaryAmount) || salaryAmount <= 0) {
        throw new Error('Salary amount must be a positive number');
      }
      
      if (!createForm.salaryPeriod) {
        throw new Error('Salary period is required');
      }
      
      // Ensure role has ROLE_ prefix
      const role = createForm.role.startsWith('ROLE_') ? createForm.role : `ROLE_${createForm.role}`;
      
      // Validate that admin is not trying to create another admin
      if (role === 'ROLE_ADMIN' || role === 'ROLE_SUPERADMIN') {
        throw new Error('You cannot create admin accounts. Only staff members (Waiter, Kitchen, Cashier) can be created.');
      }
      
      await createStaff(api, restaurantId, branchId, {
        username,
        role: role as StaffRole,
        email: createForm.email?.trim() || undefined,
        phoneNumber,
        salaryAmount,
        salaryPeriod: createForm.salaryPeriod,
      });
      
      setCreateForm(INITIAL_CREATE_FORM);
      setSuccessMessage('Staff member created successfully!');
      showToast('Staff member created successfully!', 'success');
      await refreshStaff();
    } catch (err) {
      console.error('[AdminStaff] create error', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create staff member.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (member: UserRecord) => {
    const key = member.username ?? member.email ?? null;
    if (!key) {
      setError('This staff member is missing a username. Please refresh the page.');
      return;
    }
    setEditingEmail(key);
    const memberRole = (member.role as StaffRole) || 'ROLE_WAITER';
    setEditForm({
      role: (ROLE_LABEL[memberRole] ? memberRole : 'ROLE_WAITER') as StaffRole,
      phoneNumber: member.phoneNumber ?? member.phone ?? '',
      salaryAmount: member.salaryAmount?.toString() ?? '',
      salaryPeriod: member.salaryPeriod ?? 'MONTHLY',
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
    setSuccessMessage(null);
    
    try {
      // Find the current member to check their role and get ID
      const currentMember = staff.find(
        (m) => (m.username ?? m.email) === editingEmail
      );
      if (!currentMember) {
        throw new Error('Staff member not found. Please refresh the page.');
      }
      
      const currentRole = currentMember.role;
      // Prefer ID for the endpoint, fall back to username/email if ID is not available
      const identifier = currentMember.id ?? currentMember.username ?? currentMember.email;
      if (!identifier) {
        throw new Error('Staff member identifier not found. Please refresh the page.');
      }
      
      // Validate required fields
      const phoneNumber = editForm.phoneNumber.trim();
      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }
      
      const salaryAmount = parseFloat(editForm.salaryAmount);
      if (!editForm.salaryAmount || isNaN(salaryAmount) || salaryAmount <= 0) {
        throw new Error('Salary amount must be a positive number');
      }
      
      if (!editForm.salaryPeriod) {
        throw new Error('Salary period is required');
      }
      
      // Ensure role has ROLE_ prefix
      const role = editForm.role.startsWith('ROLE_') ? editForm.role : `ROLE_${editForm.role}`;
      
      // Validate that admin is not trying to change role to admin
      if (role === 'ROLE_ADMIN' || role === 'ROLE_SUPERADMIN') {
        throw new Error('You cannot change staff role to admin. Only staff roles (Waiter, Kitchen, Cashier) are allowed.');
      }
      
      await updateStaff(api, identifier, currentRole, {
        role: role as StaffRole,
        phoneNumber,
        salaryAmount,
        salaryPeriod: editForm.salaryPeriod,
      });
      
      cancelEdit();
      setSuccessMessage('Staff member updated successfully!');
      showToast('Staff member updated successfully!', 'success');
      await refreshStaff();
    } catch (err) {
      console.error('[AdminStaff] update error', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update staff member.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: UserRecord) => {
    // Prefer ID for the endpoint, fall back to username/email if ID is not available
    const identifier = member.id ?? member.username ?? member.email;
    if (!identifier) {
      setError('Cannot delete: staff member is missing identifier. Please refresh the page.');
      return;
    }
    if (!confirm(`Remove ${member.username ?? member.email ?? 'this staff member'}?`)) return;
    setError(null);
    setSuccessMessage(null);
    
    try {
      await deleteStaff(api, identifier);
      setSuccessMessage('Staff member deleted successfully!');
      showToast('Staff member deleted successfully!', 'success');
      await refreshStaff();
    } catch (err) {
      console.error('[AdminStaff] delete error', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete staff member.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
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
          Recruit, update, and remove staff members assigned to your branch. You can only create and manage staff members (Waiter, Kitchen, Cashier), not admin accounts.
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Add staff member</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>
          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="staff-username">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              id="staff-username"
              type="text"
              required
              value={createForm.username}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, username: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="waiter john"
            />
            <p className="mt-1 text-xs text-slate-500">This will be used for login</p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="staff-role">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="staff-role"
              required
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
            <p className="mt-1 text-xs text-slate-500">Only staff roles are available</p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="staff-email">
              Email (optional)
            </label>
            <input
              id="staff-email"
              type="email"
              value={createForm.email || ''}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, email: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="waiter@restaurant.com"
            />
            <p className="mt-1 text-xs text-slate-500">Will be auto-generated if not provided</p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="staff-phone">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="staff-phone"
              type="text"
              required
              value={createForm.phoneNumber}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, phoneNumber: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="+1234567890"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="staff-salary-amount">
              Salary Amount <span className="text-red-500">*</span>
            </label>
            <input
              id="staff-salary-amount"
              type="number"
              required
              min="0"
              step="0.01"
              value={createForm.salaryAmount}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, salaryAmount: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="1000.00"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="staff-salary-period">
              Salary Period <span className="text-red-500">*</span>
            </label>
            <select
              id="staff-salary-period"
              required
              value={createForm.salaryPeriod}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, salaryPeriod: event.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {SALARY_PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
            {staff.map((member, index) => {
              const key =
                member.username ??
                member.email ??
                (member.id !== null && member.id !== undefined
                  ? String(member.id)
                  : `staff-${index}`);
              const label = member.email ?? member.username ?? 'Unknown staff';
              const roleLabel = formatRole(member.role);
              const isEditing =
                editingEmail === (member.username ?? member.email ?? null) && editingEmail !== null;

              if (isEditing) {
                return (
                  <form
                    key={`edit-${key}`}
                    className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                    onSubmit={handleEdit}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-blue-900">{label}</h3>
                        <p className="text-xs text-blue-700">User ID: {member.id ?? '—'}</p>
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
                          Role <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="edit-role"
                          required
                          value={editForm.role}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              role: event.target.value as StaffRole,
                            }))
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
                        <label className="block text-xs font-medium text-blue-800" htmlFor="edit-phone">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="edit-phone"
                          type="text"
                          required
                          value={editForm.phoneNumber}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, phoneNumber: event.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          placeholder="+1234567890"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-blue-800" htmlFor="edit-salary-amount">
                          Salary Amount <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="edit-salary-amount"
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={editForm.salaryAmount}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, salaryAmount: event.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          placeholder="1000.00"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-blue-800" htmlFor="edit-salary-period">
                          Salary Period <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="edit-salary-period"
                          required
                          value={editForm.salaryPeriod}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, salaryPeriod: event.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' }))
                          }
                          className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                          {SALARY_PERIOD_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
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
                );
              }

              return (
                <article
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-900">
                      {member.username ?? member.email ?? 'Unknown staff'}
                    </h3>
                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                      <p>Username: {member.username ?? '—'}</p>
                      {member.email && member.email !== member.username ? (
                        <p>Email: {member.email}</p>
                      ) : null}
                      <p>Role: {roleLabel}</p>
                      <p>Phone: {member.phoneNumber ?? member.phone ?? '—'}</p>
                      <p>
                        Salary: {member.salaryAmount ? `$${member.salaryAmount.toFixed(2)}` : '—'}{' '}
                        {member.salaryPeriod ? `(${member.salaryPeriod.toLowerCase()})` : ''}
                      </p>
                      {member.id ? (
                        <p className="text-slate-400">ID: {member.id}</p>
                      ) : null}
                    </div>
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
                      onClick={() => handleDelete(member)}
                      className="inline-flex items-center rounded-lg border border-red-200 px-3 py-1 text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
