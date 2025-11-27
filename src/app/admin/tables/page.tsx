'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { createTable, deleteTable, listTables, updateTable } from '@/lib/api/admin';
import type { TableEntity } from '@/types/entities';

interface CreateTableForm {
  name: string;
  seatCount: string;
  tableNumber: string;
  active: boolean;
}

interface EditTableForm {
  name: string;
  seatCount: string;
  tableNumber: string;
  active: boolean;
}

const INITIAL_CREATE_FORM: CreateTableForm = {
  name: '',
  seatCount: '',
  tableNumber: '',
  active: true,
};

export default function AdminTablesPage() {
  const { user } = useAuth();
  const api = useApi();

  const [tables, setTables] = useState<TableEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<CreateTableForm>(INITIAL_CREATE_FORM);
  const [creating, setCreating] = useState<boolean>(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTable, setEditingTable] = useState<TableEntity | null>(null);
  const [editForm, setEditForm] = useState<EditTableForm>({
    name: '',
    seatCount: '',
    tableNumber: '',
    active: true,
  });
  const [saving, setSaving] = useState<boolean>(false);

  const branchId = user?.branchId ?? null;
  const restaurantId = user?.restaurantId ?? null;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!restaurantId || !branchId) {
        setTables([]);
        setLoading(false);
        setError('Your profile is missing restaurant or branch assignments.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await listTables(api, restaurantId, branchId);
        if (!cancelled) {
          setTables(data);
        }
      } catch (err) {
        console.error('[AdminTables] load error', err);
        if (!cancelled) {
          setError('Failed to load table list.');
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
  }, [api, branchId, restaurantId, user]);

  const refreshTables = async () => {
    if (!restaurantId || !branchId) return;
    try {
      const data = await listTables(api, restaurantId, branchId);
      setTables(data);
    } catch (err) {
      console.error('[AdminTables] refresh error', err);
      setError('Failed to refresh table list.');
    }
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!restaurantId || !branchId) return;
    setCreating(true);
    setError(null);
    try {
      const seatCount = createForm.seatCount ? Number(createForm.seatCount) : null;
      const tableNumber = createForm.tableNumber ? Number(createForm.tableNumber) : null;
      await createTable(api, restaurantId, branchId, {
        name: createForm.name.trim() || `Table ${Date.now()}`,
        seatCount,
        tableNumber,
        active: createForm.active,
      });
      setCreateForm(INITIAL_CREATE_FORM);
      await refreshTables();
    } catch (err) {
      console.error('[AdminTables] create error', err);
      setError('Failed to create table.');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (table: TableEntity) => {
    setEditingId(table.id);
    setEditingTable(table);
    setEditForm({
      name: table.name ?? '',
      seatCount: table.seatCount != null ? String(table.seatCount) : '',
      tableNumber: table.tableNumber != null ? String(table.tableNumber) : '',
      active: table.active ?? true,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTable(null);
    setEditForm({ name: '', seatCount: '', tableNumber: '', active: true });
  };

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingId == null || !editingTable) return;
    setSaving(true);
    setError(null);
    try {
      const seatCount = editForm.seatCount ? Number(editForm.seatCount) : null;
      const tableNumber = editForm.tableNumber ? Number(editForm.tableNumber) : null;
      await updateTable(api, editingId, {
        name: editForm.name.trim() || `Table ${editingId}`,
        seatCount,
        tableNumber,
        restaurantId: editingTable.restaurantId,
        branchId: editingTable.branchId,
      });
      cancelEdit();
      await refreshTables();
    } catch (err) {
      console.error('[AdminTables] update error', err);
      setError('Failed to update table.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tableId: number) => {
    if (!confirm('Remove this table?')) return;
    setError(null);
    try {
      await deleteTable(api, tableId);
      await refreshTables();
    } catch (err) {
      console.error('[AdminTables] delete error', err);
      setError('Failed to delete table.');
    }
  };

  if (user?.role !== 'ROLE_ADMIN') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900">
        Access restricted to Admin role.
      </div>
    );
  }

  if (!restaurantId || !branchId) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        Your administrator profile is missing restaurant or branch assignments. Please contact your
        SuperAdmin.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Tables</h1>
        <p className="text-sm text-slate-500">
          Manage the tables assigned to your branch, including capacity and numbering.
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Add table</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4" onSubmit={handleCreate}>
          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="table-name">
              Table name
            </label>
            <input
              id="table-name"
              value={createForm.name}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Window table"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="table-number">
              Table number
            </label>
            <input
              id="table-number"
              value={createForm.tableNumber}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, tableNumber: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="table-seat">
              Seat count
            </label>
            <input
              id="table-seat"
              value={createForm.seatCount}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, seatCount: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="4"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4 flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={createForm.active}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, active: event.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Active
            </label>
          </div>
          <div className="md:col-span-2 lg:col-span-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? 'Adding…' : 'Add table'}
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
          <h2 className="text-lg font-semibold text-slate-800">Current tables</h2>
          <span className="text-xs font-medium text-slate-500">
            {tables.length} {tables.length === 1 ? 'table' : 'tables'}
          </span>
        </div>

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            Loading tables…
          </div>
        ) : tables.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
            No tables configured for this branch.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {tables.map((table) =>
              editingId === table.id ? (
                <form
                  key={table.id}
                  className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                  onSubmit={handleEdit}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-blue-900">
                        Editing Table {table.tableNumber ?? table.id}
                      </h3>
                      <p className="text-xs text-blue-700">Table ID: {table.id}</p>
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
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-blue-800">Name</label>
                      <input
                        value={editForm.name}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, name: event.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-800">Table number</label>
                      <input
                        value={editForm.tableNumber}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, tableNumber: event.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-800">Seat count</label>
                      <input
                        value={editForm.seatCount}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, seatCount: event.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-sm text-blue-800">
                    <input
                      type="checkbox"
                      checked={editForm.active}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, active: event.target.checked }))
                      }
                      className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    Active
                  </label>
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
                  key={table.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Table {table.tableNumber ?? table.id}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Seats {table.seatCount ?? 'N/A'} • {table.active ? 'Active' : 'Inactive'}
                      </p>
                      {table.name ? (
                        <p className="text-xs text-slate-500">Label: {table.name}</p>
                      ) : null}
                      {table.qrCode ? (
                        <p className="text-xs text-slate-400 break-all">QR: {table.qrCode}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2 text-xs font-medium text-slate-600">
                      <button
                        type="button"
                        onClick={() => startEdit(table)}
                        className="inline-flex items-center rounded-lg border border-blue-200 px-3 py-1 text-blue-600 transition hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(table.id)}
                        className="inline-flex items-center rounded-lg border border-red-200 px-3 py-1 text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
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

