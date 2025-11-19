'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import type { Branch, MenuItem, TableEntity, WaiterUser } from '@/types/entities';

interface BranchDetails {
  menu: MenuItem[];
  tables: TableEntity[];
  waiters: WaiterUser[];
  loading: boolean;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const api = useApi();
  const branchId = user?.branchId ?? null;
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branchDetails, setBranchDetails] = useState<Record<number, BranchDetails>>({});

  const loadBranchDetails = useCallback(
    async (branchId: number) => {
      setBranchDetails((prev) => ({
        ...prev,
        [branchId]: {
          menu: prev[branchId]?.menu ?? [],
          tables: prev[branchId]?.tables ?? [],
          waiters: prev[branchId]?.waiters ?? [],
          loading: true,
        },
      }));

      try {
        const [menuRes, tablesRes, waitersRes] = await Promise.all([
          api.get<MenuItem[]>('/menu', { params: { branchId } }),
          api.get<TableEntity[]>(`/branches/${branchId}/tables`),
          api.get<WaiterUser[]>(`/branches/${branchId}/waiters`),
        ]);

        setBranchDetails((prev) => ({
          ...prev,
          [branchId]: {
            menu: menuRes.data ?? [],
            tables: tablesRes.data ?? [],
            waiters: waitersRes.data ?? [],
            loading: false,
          },
        }));
      } catch (err) {
        console.error('[AdminDashboard] loadBranchDetails', err);
        setBranchDetails((prev) => ({
          ...prev,
          [branchId]: {
            menu: prev[branchId]?.menu ?? [],
            tables: prev[branchId]?.tables ?? [],
            waiters: prev[branchId]?.waiters ?? [],
            loading: false,
          },
        }));
      }
    },
    [api]
  );

  const loadBranches = useCallback(async () => {
    if (!branchId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<Branch>(`/branches/${branchId}`);
      const branch = response.data ?? null;
      setBranches(branch ? [branch] : []);
      if (branch) {
        void loadBranchDetails(branch.id);
      }
    } catch (err) {
      console.error('[AdminDashboard] loadBranches', err);
      setError('Could not load your assigned branch details.');
    } finally {
      setLoading(false);
    }
  }, [api, branchId, loadBranchDetails]);

  useEffect(() => {
    if (user?.role === 'ROLE_ADMIN' && branchId) {
      void loadBranches();
    }
  }, [user, branchId, loadBranches]);

  const handleAddMenuItem = async (branchId: number) => {
    const name = prompt('Menu item name');
    if (!name) return;
    const priceValue = prompt('Price (e.g. 9.99)');
    if (!priceValue) return;
    const price = Number(priceValue);
    if (Number.isNaN(price)) {
      alert('Invalid price');
      return;
    }
    const description = prompt('Description (optional)') || undefined;
    const category = prompt('Category (optional)') || undefined;

    try {
      await api.post('/menu', { branchId, name, price, description, category });
      alert('Menu item added');
      void loadBranchDetails(branchId);
    } catch (err) {
      console.error('[AdminDashboard] addMenu', err);
      alert('Failed to add menu item');
    }
  };

  const handleDeleteMenuItem = async (branchId: number, menuId: number) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await api.delete(`/menu/${menuId}`);
      alert('Menu item deleted');
      void loadBranchDetails(branchId);
    } catch (err) {
      console.error('[AdminDashboard] deleteMenu', err);
      alert('Failed to delete menu item');
    }
  };

  const handleEditMenuItem = async (branchId: number, item: MenuItem) => {
    const name = prompt('Menu item name', item.name);
    if (!name) return;
    const priceValue = prompt('Price (e.g. 9.99)', item.price.toString());
    if (!priceValue) return;
    const price = Number(priceValue);
    if (Number.isNaN(price)) {
      alert('Invalid price');
      return;
    }
    const description = prompt('Description (optional)', item.description ?? undefined) || undefined;
    const category = prompt('Category (optional)', item.category ?? undefined) || undefined;
    try {
      await api.put(`/menu/${item.id}`, {
        branchId,
        name,
        price,
        description,
        category,
        available: item.available,
      });
      alert('Menu item updated');
      void loadBranchDetails(branchId);
    } catch (err) {
      console.error('[AdminDashboard] editMenu', err);
      alert('Failed to update menu item');
    }
  };

  const handleAddTable = async (branchId: number) => {
    const numberValue = prompt('Table number');
    if (!numberValue) return;
    const number = Number(numberValue);
    const capacityValue = prompt('Capacity');
    if (!capacityValue) return;
    const capacity = Number(capacityValue);
    if (Number.isNaN(number) || Number.isNaN(capacity)) {
      alert('Invalid table data');
      return;
    }
    try {
      await api.post(`/branches/${branchId}/tables`, { number, capacity });
      alert('Table added');
      void loadBranchDetails(branchId);
    } catch (err) {
      console.error('[AdminDashboard] addTable', err);
      alert('Failed to add table');
    }
  };

  const handleDeleteTable = async (branchId: number, tableId: number) => {
    if (!confirm('Delete this table?')) return;
    try {
      await api.delete(`/tables/${tableId}`);
      alert('Table deleted');
      void loadBranchDetails(branchId);
    } catch (err) {
      console.error('[AdminDashboard] deleteTable', err);
      alert('Failed to delete table');
    }
  };

  const handleEditTable = async (branchId: number, table: TableEntity) => {
    const numberValue = prompt('Table number', table.number.toString());
    if (!numberValue) return;
    const number = Number(numberValue);
    if (Number.isNaN(number)) {
      alert('Invalid table number');
      return;
    }
    const capacityValue = prompt('Capacity', table.capacity.toString());
    if (!capacityValue) return;
    const capacity = Number(capacityValue);
    if (Number.isNaN(capacity)) {
      alert('Invalid capacity');
      return;
    }
    try {
      await api.put(`/tables/${table.id}`, { ...table, number, capacity, branchId });
      alert('Table updated');
      void loadBranchDetails(branchId);
    } catch (err) {
      console.error('[AdminDashboard] editTable', err);
      alert('Failed to update table');
    }
  };

  const handleAddWaiter = async (branchId: number) => {
    const username = prompt('Waiter username');
    if (!username) return;
    const email = prompt('Waiter email (optional)') || undefined;
    const password = prompt('Temporary password');
    if (!password) return;
    try {
      await api.post(`/branches/${branchId}/waiters`, { username, email, password });
      alert('Waiter added');
      void loadBranchDetails(branchId);
    } catch (err) {
      console.error('[AdminDashboard] addWaiter', err);
      alert('Failed to add waiter');
    }
  };

  const handleDeleteWaiter = async (branchId: number, waiterId: number) => {
    if (!confirm('Delete this waiter?')) return;
    try {
      await api.delete(`/waiters/${waiterId}`);
      alert('Waiter deleted');
      void loadBranchDetails(branchId);
    } catch (err) {
      console.error('[AdminDashboard] deleteWaiter', err);
      alert('Failed to delete waiter');
    }
  };

  const handleEditWaiter = async (branchId: number, waiter: WaiterUser) => {
    const username = prompt('Waiter username', waiter.username);
    if (!username) return;
    const emailInput = prompt('Waiter email (optional)', waiter.email ?? '') ?? '';
    try {
      await api.put(`/waiters/${waiter.id}`, {
        username,
        email: emailInput.trim() || undefined,
        branchId,
      });
      alert('Waiter updated');
      void loadBranchDetails(branchId);
    } catch (err) {
      console.error('[AdminDashboard] editWaiter', err);
      alert('Failed to update waiter');
    }
  };

  if (user?.role !== 'ROLE_ADMIN') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-4 text-amber-900">
        Access restricted to Admin role.
      </div>
    );
  }

  if (!branchId) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        Your administrator profile is missing a branch assignment.
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage menu, tables, and waiter team for your assigned branches.
        </p>
      </header>

      <section id="branches" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Branches</h2>
          <button
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            onClick={() => loadBranches()}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="card text-sm text-slate-500">Loading branches…</div>
        ) : error ? (
          <div className="card border-red-200 bg-red-50 text-sm text-red-700">{error}</div>
        ) : branches.length === 0 ? (
          <div className="card text-sm text-slate-500">
            No branches assigned. Please contact your SuperAdmin.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {branches.map((branch) => {
              const detail = branchDetails[branch.id];
              return (
                <div key={branch.id} className="card space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{branch.name}</h3>
                    {branch.address && (
                      <p className="text-sm text-slate-500">{branch.address}</p>
                    )}
                  </div>

                  {detail?.loading ? (
                    <p className="text-xs text-slate-400">Loading branch data…</p>
                  ) : (
                    <div className="space-y-4">
                      <section id="menu" className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-slate-700">Menu</h4>
                          <button
                            className="text-xs font-medium text-blue-600 hover:text-blue-700"
                            onClick={() => handleAddMenuItem(branch.id)}
                          >
                            + Add item
                          </button>
                        </div>

                        {detail?.menu?.length ? (
                          <ul className="space-y-2">
                            {detail.menu.map((item) => (
                              <li
                                key={item.id}
                                className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
                              >
                                <div>
                                  <p className="text-sm font-medium text-slate-800">{item.name}</p>
                                  <p className="text-xs text-slate-500">
                                    ${item.price.toFixed(2)}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                    onClick={() => handleEditMenuItem(branch.id, item)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="text-xs font-medium text-red-600 hover:text-red-700"
                                    onClick={() => handleDeleteMenuItem(branch.id, item.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-400">No menu items yet.</p>
                        )}
                      </section>

                      <section id="tables" className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-slate-700">Tables</h4>
                          <button
                            className="text-xs font-medium text-blue-600 hover:text-blue-700"
                            onClick={() => handleAddTable(branch.id)}
                          >
                            + Add table
                          </button>
                        </div>
                        {detail?.tables?.length ? (
                          <ul className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                            {detail.tables.map((table) => (
                              <li
                                key={table.id}
                                className="rounded border border-slate-200 px-2 py-2"
                              >
                                <p>
                                  <span className="font-medium text-slate-700">
                                    Table {table.number}
                                  </span>
                                  <span className="ml-1 text-slate-400">
                                    · {table.capacity} seats
                                  </span>
                                </p>
                                <div className="mt-1 flex gap-2">
                                  <button
                                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
                                    onClick={() => handleEditTable(branch.id, table)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="text-[11px] font-medium text-red-600 hover:text-red-700"
                                    onClick={() => handleDeleteTable(branch.id, table.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-400">No tables configured yet.</p>
                        )}
                      </section>

                      <section id="waiters" className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-slate-700">Waiter Team</h4>
                          <button
                            className="text-xs font-medium text-blue-600 hover:text-blue-700"
                            onClick={() => handleAddWaiter(branch.id)}
                          >
                            + Add waiter
                          </button>
                        </div>

                        {detail?.waiters?.length ? (
                          <ul className="space-y-2 text-sm text-slate-600">
                            {detail.waiters.map((waiter) => (
                              <li
                                key={waiter.id}
                                className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
                              >
                                <div>
                                  <p className="font-medium text-slate-800">{waiter.username}</p>
                                  {waiter.email && (
                                    <p className="text-xs text-slate-500">{waiter.email}</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                    onClick={() => handleEditWaiter(branch.id, waiter)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="text-xs font-medium text-red-600 hover:text-red-700"
                                    onClick={() => handleDeleteWaiter(branch.id, waiter.id)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-400">No waiters assigned yet.</p>
                        )}
                      </section>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

