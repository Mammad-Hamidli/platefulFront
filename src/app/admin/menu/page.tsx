'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { createMenuItem, deleteMenuItem, listMenuItems, updateMenuItem } from '@/lib/api/admin';
import type { MenuItem } from '@/types/entities';

interface CreateMenuItemForm {
  name: string;
  description: string;
  priceCents: string; // User enters as dollars, convert to cents
  category: string;
  isAvailable: boolean;
}

interface EditMenuItemForm {
  name: string;
  description: string;
  priceCents: string;
  category: string;
  isAvailable: boolean;
}

const INITIAL_CREATE_FORM: CreateMenuItemForm = {
  name: '',
  description: '',
  priceCents: '',
  category: '',
  isAvailable: true,
};

export default function AdminMenuPage() {
  const { user } = useAuth();
  const api = useApi();

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  const [createForm, setCreateForm] = useState<CreateMenuItemForm>(INITIAL_CREATE_FORM);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditMenuItemForm>({
    name: '',
    description: '',
    priceCents: '',
    category: '',
    isAvailable: true,
  });
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    if (user?.role === 'ROLE_ADMIN' && restaurantId) {
      void refreshMenu();
    }
  }, [user, restaurantId]);

  const refreshMenu = async () => {
    if (!restaurantId) return;
    try {
      const data = await listMenuItems(api, restaurantId);
      setMenu(data);
    } catch (err) {
      console.error('[AdminMenu] refresh error', err);
      setError('Failed to refresh menu items.');
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!restaurantId) return;
    setCreating(true);
    setError(null);
    try {
      const name = createForm.name.trim();
      if (!name) {
        throw new Error('Menu item name is required');
      }
      const priceDollars = parseFloat(createForm.priceCents);
      if (isNaN(priceDollars) || priceDollars <= 0) {
        throw new Error('Price must be a positive number');
      }
      const priceCents = Math.round(priceDollars * 100);
      await createMenuItem(api, restaurantId, {
        name,
        description: createForm.description.trim() || null,
        priceCents,
        category: createForm.category.trim() || null,
        isAvailable: createForm.isAvailable,
      });
      setCreateForm(INITIAL_CREATE_FORM);
      setShowCreate(false);
      await refreshMenu();
    } catch (err) {
      console.error('[AdminMenu] create error', err);
      setError(err instanceof Error ? err.message : 'Failed to create menu item.');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      description: item.description ?? '',
      priceCents: item.priceCents ? (item.priceCents / 100).toFixed(2) : '',
      category: item.category ?? '',
      isAvailable: item.isAvailable,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: '',
      description: '',
      priceCents: '',
      category: '',
      isAvailable: true,
    });
  };

  const handleEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingId == null) return;
    setSaving(true);
    setError(null);
    try {
      const name = editForm.name.trim();
      if (!name) {
        throw new Error('Menu item name is required');
      }
      const priceDollars = parseFloat(editForm.priceCents);
      if (isNaN(priceDollars) || priceDollars <= 0) {
        throw new Error('Price must be a positive number');
      }
      const priceCents = Math.round(priceDollars * 100);
      await updateMenuItem(api, editingId, {
        name,
        description: editForm.description.trim() || null,
        priceCents,
        category: editForm.category.trim() || null,
        isAvailable: editForm.isAvailable,
      });
      cancelEdit();
      await refreshMenu();
    } catch (err) {
      console.error('[AdminMenu] update error', err);
      setError(err instanceof Error ? err.message : 'Failed to update menu item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (menuItemId: number) => {
    if (!confirm('Delete this menu item?')) return;
    setError(null);
    try {
      await deleteMenuItem(api, menuItemId);
      await refreshMenu();
    } catch (err) {
      console.error('[AdminMenu] delete error', err);
      setError('Failed to delete menu item.');
    }
  };

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
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Menu</h1>
          <p className="text-sm text-slate-500">
            Manage menu items for your restaurant.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreateForm(INITIAL_CREATE_FORM);
            setShowCreate(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Add menu item
        </button>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {showCreate && (
        <section className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-blue-900">Add menu item</h2>
          <form className="mt-4 space-y-4" onSubmit={handleCreate}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-blue-800" htmlFor="menu-name">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="menu-name"
                  required
                  value={createForm.name}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Burger"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-800" htmlFor="menu-price">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  id="menu-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={createForm.priceCents}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, priceCents: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="9.99"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-800" htmlFor="menu-category">
                  Category
                </label>
                <input
                  id="menu-category"
                  value={createForm.category}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, category: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Main"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-blue-800">
                  <input
                    type="checkbox"
                    checked={createForm.isAvailable}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, isAvailable: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                  Available
                </label>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-blue-800" htmlFor="menu-description">
                  Description
                </label>
                <textarea
                  id="menu-description"
                  value={createForm.description}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Delicious burger with..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? 'Creating…' : 'Create menu item'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreateForm(INITIAL_CREATE_FORM);
                  setShowCreate(false);
                }}
                className="text-sm font-medium text-blue-700 hover:text-blue-900"
                disabled={creating}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

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
            {filteredMenu.map((item) =>
              editingId === item.id ? (
                <li key={item.id} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 shadow-sm">
                  <form onSubmit={handleEdit}>
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-semibold text-blue-900">Editing: {item.name}</h3>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-xs font-medium text-blue-700 hover:text-blue-900"
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-blue-800">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          value={editForm.name}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, name: event.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-blue-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-800">
                          Price ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          value={editForm.priceCents}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, priceCents: event.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-blue-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-800">Category</label>
                        <input
                          value={editForm.category}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, category: event.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-blue-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-800">Description</label>
                        <textarea
                          value={editForm.description}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, description: event.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-blue-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                          rows={2}
                        />
                      </div>
                      <label className="flex items-center gap-2 text-xs text-blue-800">
                        <input
                          type="checkbox"
                          checked={editForm.isAvailable}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, isAvailable: event.target.checked }))
                          }
                          className="h-3 w-3 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                        />
                        Available
                      </label>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </form>
                </li>
              ) : (
                <li key={item.id} className="rounded-lg border border-slate-200 px-3 py-2 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
                      <span className="text-xs font-medium text-slate-500">
                        ${((item.priceCents ?? 0) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
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
              )
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

