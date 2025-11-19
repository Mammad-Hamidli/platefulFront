'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import type {
  AdminUser,
  Branch,
  MenuItem,
  Restaurant,
  StaffMember,
  TableEntity,
  WaiterUser,
} from '@/types/entities';

interface BranchState {
  branches: Branch[];
  loading: boolean;
}

interface AdminState {
  admins: AdminUser[];
  loading: boolean;
}

interface BranchDetailsState {
  menu: MenuItem[];
  tables: TableEntity[];
  waiters: WaiterUser[];
  loading: boolean;
}

interface StaffState {
  staff: StaffMember[];
  loading: boolean;
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const api = useApi();
  const restaurantId = user?.restaurantId ?? null;
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Record<number, BranchState>>({});
  const [admins, setAdmins] = useState<Record<number, AdminState>>({});
  const [branchDetails, setBranchDetails] = useState<Record<number, BranchDetailsState>>({});
  const [restaurantStaff, setRestaurantStaff] = useState<Record<number, StaffState>>({});

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
        const [menuResponse, tablesResponse, waitersResponse] = await Promise.all([
          api.get<MenuItem[]>('/menu', { params: { branchId } }),
          api.get<TableEntity[]>(`/branches/${branchId}/tables`),
          api.get<WaiterUser[]>(`/branches/${branchId}/waiters`),
        ]);

        setBranchDetails((prev) => ({
          ...prev,
          [branchId]: {
            menu: menuResponse.data ?? [],
            tables: tablesResponse.data ?? [],
            waiters: waitersResponse.data ?? [],
            loading: false,
          },
        }));
      } catch (err) {
        console.error('[SuperAdmin] loadBranchDetails', err);
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

  const loadBranches = useCallback(
    async (restaurantId: number) => {
      setBranches((prev) => ({
        ...prev,
        [restaurantId]: {
          branches: prev[restaurantId]?.branches ?? [],
          loading: true,
        },
      }));

      try {
        const response = await api.get<Branch[]>(`/restaurants/${restaurantId}/branches`);
        const data = response.data ?? [];
        setBranches((prev) => ({
          ...prev,
          [restaurantId]: {
            branches: data,
            loading: false,
          },
        }));

        data.forEach((branch) => {
          void loadBranchDetails(branch.id);
        });
      } catch (err) {
        console.error('[SuperAdmin] loadBranches', err);
        setBranches((prev) => ({
          ...prev,
          [restaurantId]: {
            branches: prev[restaurantId]?.branches ?? [],
            loading: false,
          },
        }));
      }
    },
    [api, loadBranchDetails]
  );

  const loadAdmins = useCallback(
    async (restaurantId: number) => {
      setAdmins((prev) => ({
        ...prev,
        [restaurantId]: {
          admins: prev[restaurantId]?.admins ?? [],
          loading: true,
        },
      }));

      try {
        const response = await api.get<AdminUser[]>(`/restaurants/${restaurantId}/admins`);
        setAdmins((prev) => ({
          ...prev,
          [restaurantId]: {
            admins: response.data ?? [],
            loading: false,
          },
        }));
      } catch (err) {
        console.error('[SuperAdmin] loadAdmins', err);
        setAdmins((prev) => ({
          ...prev,
          [restaurantId]: {
            admins: prev[restaurantId]?.admins ?? [],
            loading: false,
          },
        }));
      }
    },
    [api]
  );

  const loadRestaurantStaff = useCallback(
    async (restaurantIdParam: number) => {
      setRestaurantStaff((prev) => ({
        ...prev,
        [restaurantIdParam]: {
          staff: prev[restaurantIdParam]?.staff ?? [],
          loading: true,
        },
      }));

      try {
        const response = await api.get<StaffMember[]>(`/restaurants/${restaurantIdParam}/staff`);
        setRestaurantStaff((prev) => ({
          ...prev,
          [restaurantIdParam]: {
            staff: response.data ?? [],
            loading: false,
          },
        }));
      } catch (err) {
        console.error('[SuperAdmin] loadRestaurantStaff', err);
        setRestaurantStaff((prev) => ({
          ...prev,
          [restaurantIdParam]: {
            staff: prev[restaurantIdParam]?.staff ?? [],
            loading: false,
          },
        }));
      }
    },
    [api]
  );

  const loadRestaurants = useCallback(async () => {
    if (!restaurantId) {
      setRestaurants([]);
      setRestaurantsLoading(false);
      setError('No restaurant assignment found for this super administrator.');
      return;
    }

    try {
      setRestaurantsLoading(true);
      setError(null);
      const response = await api.get<Restaurant>(`/restaurants/${restaurantId}`);
      const restaurant = response.data;
      setRestaurants(restaurant ? [restaurant] : []);

      if (restaurant) {
        await Promise.all([
          loadAdmins(restaurant.id),
          loadBranches(restaurant.id),
          loadRestaurantStaff(restaurant.id),
        ]);
      }
    } catch (err) {
      console.error('[SuperAdmin] loadRestaurants', err);
      setError('Failed to load restaurant information');
    } finally {
      setRestaurantsLoading(false);
    }
  }, [api, restaurantId, loadAdmins, loadBranches, loadRestaurantStaff]);

  useEffect(() => {
    if (user?.role === 'ROLE_SUPERADMIN' && restaurantId) {
      void loadRestaurants();
    }
  }, [user, restaurantId, loadRestaurants]);

  const handleCreateAdmin = async (restaurantId: number) => {
    const username = prompt('Admin username');
    if (!username) return;
    const email = prompt('Admin email (optional)') || undefined;
    const password = prompt('Temporary password for admin');
    if (!password) return;

    try {
      await api.post('/users/admins', {
        username,
        email,
        password,
        restaurantId,
      });
      alert('Admin created successfully');
      void loadAdmins(restaurantId);
    } catch (err) {
      console.error('[SuperAdmin] createAdmin', err);
      alert('Failed to create admin');
    }
  };

  const handleDeleteAdmin = async (restaurantId: number, adminId: number) => {
    const confirmed = confirm('Delete this admin?');
    if (!confirmed) return;
    try {
      await api.delete(`/users/admins/${adminId}`);
      alert('Admin deleted');
      void loadAdmins(restaurantId);
      void loadRestaurantStaff(restaurantId);
    } catch (err) {
      console.error('[SuperAdmin] deleteAdmin', err);
      alert('Failed to delete admin');
    }
  };

  const handleEditAdmin = async (restaurantIdParam: number, admin: AdminUser) => {
    const username = prompt('Admin username', admin.username);
    if (!username) return;
    const emailInput = prompt('Admin email (optional)', admin.email ?? '') ?? '';
    const payload = {
      username,
      email: emailInput.trim() || undefined,
    };
    try {
      await api.put(`/users/admins/${admin.id}`, payload);
      alert('Admin updated');
      void loadAdmins(restaurantIdParam);
      void loadRestaurantStaff(restaurantIdParam);
    } catch (err) {
      console.error('[SuperAdmin] editAdmin', err);
      alert('Failed to update admin');
    }
  };

  const handleCreateBranch = async (restaurantId: number) => {
    const name = prompt('Branch name');
    if (!name) return;
    const address = prompt('Branch address') || undefined;
    try {
      await api.post('/branches', { restaurantId, name, address });
      alert('Branch created');
      void loadBranches(restaurantId);
    } catch (err) {
      console.error('[SuperAdmin] createBranch', err);
      alert('Failed to create branch');
    }
  };

  const handleEditBranch = async (restaurantId: number, branch: Branch) => {
    const name = prompt('Branch name', branch.name);
    if (!name) return;
    const address = prompt('Branch address', branch.address ?? undefined) || undefined;
    try {
      await api.put(`/branches/${branch.id}`, { ...branch, name, address });
      alert('Branch updated');
      void loadBranches(restaurantId);
    } catch (err) {
      console.error('[SuperAdmin] editBranch', err);
      alert('Failed to update branch');
    }
  };

  const handleDeleteBranch = async (restaurantId: number, branchId: number) => {
    if (!confirm('Delete this branch? This cannot be undone.')) return;
    try {
      await api.delete(`/branches/${branchId}`);
      alert('Branch deleted');
      void loadBranches(restaurantId);
    } catch (err) {
      console.error('[SuperAdmin] deleteBranch', err);
      alert('Failed to delete branch');
    }
  };

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
      console.error('[SuperAdmin] addMenuItem', err);
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
      console.error('[SuperAdmin] deleteMenuItem', err);
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
      console.error('[SuperAdmin] editMenuItem', err);
      alert('Failed to update menu item');
    }
  };

  const handleAddTable = async (branchId: number) => {
    const numberValue = prompt('Table number');
    if (!numberValue) return;
    const number = Number(numberValue);
    if (Number.isNaN(number)) {
      alert('Invalid table number');
      return;
    }
    const capacityValue = prompt('Capacity');
    if (!capacityValue) return;
    const capacity = Number(capacityValue);
    if (Number.isNaN(capacity)) {
      alert('Invalid capacity');
      return;
    }

    try {
      await api.post(`/branches/${branchId}/tables`, { number, capacity });
      alert('Table added');
      void loadBranchDetails(branchId);
    } catch (err) {
      console.error('[SuperAdmin] addTable', err);
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
      console.error('[SuperAdmin] deleteTable', err);
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
      console.error('[SuperAdmin] editTable', err);
      alert('Failed to update table');
    }
  };

  const handleAddWaiter = async (restaurantIdParam: number, branchId: number) => {
    const username = prompt('Waiter username');
    if (!username) return;
    const email = prompt('Waiter email (optional)') || undefined;
    const password = prompt('Temporary password');
    if (!password) return;
    try {
      await api.post(`/branches/${branchId}/waiters`, { username, email, password });
      alert('Waiter added');
      void loadBranchDetails(branchId);
      void loadRestaurantStaff(restaurantIdParam);
    } catch (err) {
      console.error('[SuperAdmin] addWaiter', err);
      alert('Failed to add waiter');
    }
  };

  const handleEditWaiter = async (restaurantIdParam: number, branchId: number, waiter: WaiterUser) => {
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
      void loadRestaurantStaff(restaurantIdParam);
    } catch (err) {
      console.error('[SuperAdmin] editWaiter', err);
      alert('Failed to update waiter');
    }
  };

  const handleDeleteWaiter = async (restaurantIdParam: number, branchId: number, waiterId: number) => {
    if (!confirm('Delete this waiter?')) return;
    try {
      await api.delete(`/waiters/${waiterId}`);
      alert('Waiter deleted');
      void loadBranchDetails(branchId);
      void loadRestaurantStaff(restaurantIdParam);
    } catch (err) {
      console.error('[SuperAdmin] deleteWaiter', err);
      alert('Failed to delete waiter');
    }
  };

  if (user?.role !== 'ROLE_SUPERADMIN') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-4 text-amber-900">
        Access restricted to SuperAdmin role.
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        No restaurant assignment detected for this super administrator account.
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">SuperAdmin Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage restaurants, administrators, branches, menu items, and tables.
        </p>
      </header>

      <section id="restaurants" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Restaurants</h2>
          <button
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            onClick={() => loadRestaurants()}
          >
            Refresh
          </button>
        </div>

        {restaurantsLoading ? (
          <div className="card text-sm text-slate-500">Loading restaurants…</div>
        ) : error ? (
          <div className="card border-red-200 bg-red-50 text-sm text-red-700">{error}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {restaurants.map((restaurant) => {
              const branchState = branches[restaurant.id];
              const adminState = admins[restaurant.id];
              return (
                <div key={restaurant.id} className="card space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{restaurant.name}</h3>
                    {restaurant.description && (
                      <p className="text-sm text-slate-500">{restaurant.description}</p>
                    )}
                    {restaurant.address && (
                      <p className="text-sm text-slate-400">{restaurant.address}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-700">Admins</h4>
                      <button
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        onClick={() => handleCreateAdmin(restaurant.id)}
                      >
                        + Add admin
                      </button>
                    </div>
                    <div className="space-y-2">
                      {adminState?.loading ? (
                        <p className="text-xs text-slate-400">Loading admins…</p>
                      ) : adminState?.admins?.length ? (
                        adminState.admins.map((admin) => (
                          <div
                            key={admin.id}
                            className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-800">{admin.username}</p>
                              {admin.email && (
                                <p className="text-xs text-slate-500">{admin.email}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                onClick={() => handleEditAdmin(restaurant.id, admin)}
                              >
                                Edit
                              </button>
                              <button
                                className="text-xs font-medium text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteAdmin(restaurant.id, admin.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">No admins assigned yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-700">Staff</h4>
                      <button
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        onClick={() => loadRestaurantStaff(restaurant.id)}
                      >
                        Refresh staff
                      </button>
                    </div>
                    <div className="space-y-2">
                      {restaurantStaff[restaurant.id]?.loading ? (
                        <p className="text-xs text-slate-400">Loading staff…</p>
                      ) : restaurantStaff[restaurant.id]?.staff?.length ? (
                        restaurantStaff[restaurant.id]!.staff.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {member.username}
                              </p>
                              <p className="text-xs text-slate-500">
                                {member.role.replace('ROLE_', '')}
                                {member.branchId ? ` · Branch ${member.branchId}` : ''}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">No staff records.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2" id="branches">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-700">Branches</h4>
                      <button
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        onClick={() => handleCreateBranch(restaurant.id)}
                      >
                        + Add branch
                      </button>
                    </div>

                    {branchState?.loading ? (
                      <p className="text-xs text-slate-400">Loading branches…</p>
                    ) : branchState?.branches?.length ? (
                      branchState.branches.map((branch) => {
                        const detail = branchDetails[branch.id];
                        return (
                          <div
                            key={branch.id}
                            className="space-y-3 rounded-lg border border-slate-200 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-slate-800">{branch.name}</p>
                                {branch.address && (
                                  <p className="text-xs text-slate-500">{branch.address}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                  onClick={() => handleEditBranch(restaurant.id, branch)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="text-xs font-medium text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteBranch(restaurant.id, branch.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Menu
                                </h5>
                                <button
                                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                  onClick={() => handleAddMenuItem(branch.id)}
                                >
                                  + Add item
                                </button>
                              </div>
                              {detail?.loading ? (
                                <p className="text-xs text-slate-400">Loading menu…</p>
                              ) : detail?.menu?.length ? (
                                <ul className="space-y-1 text-xs text-slate-600">
                                  {detail.menu.map((item) => (
                                    <li
                                      key={item.id}
                                      className="flex items-center justify-between rounded border border-slate-200 px-2 py-1"
                                    >
                                      <span>
                                        <span className="font-medium text-slate-700">
                                          {item.name}
                                        </span>{' '}
                                        <span className="text-slate-400">
                                          ${item.price.toFixed(2)}
                                        </span>
                                      </span>
                                      <div className="flex gap-2">
                                        <button
                                          className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
                                          onClick={() => handleEditMenuItem(branch.id, item)}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          className="text-[11px] font-medium text-red-600 hover:text-red-700"
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
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Tables
                                </h5>
                                <button
                                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                  onClick={() => handleAddTable(branch.id)}
                                >
                                  + Add table
                                </button>
                              </div>
                              {detail?.loading ? (
                                <p className="text-xs text-slate-400">Loading tables…</p>
                              ) : detail?.tables?.length ? (
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
                                <p className="text-xs text-slate-400">No tables registered.</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Waiter Team
                                </h5>
                                <button
                                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                  onClick={() => handleAddWaiter(restaurant.id, branch.id)}
                                >
                                  + Add waiter
                                </button>
                              </div>
                              {detail?.loading ? (
                                <p className="text-xs text-slate-400">Loading waiters…</p>
                              ) : detail?.waiters?.length ? (
                                <ul className="space-y-1 text-xs text-slate-600">
                                  {detail.waiters.map((waiter) => (
                                    <li
                                      key={waiter.id}
                                      className="flex items-center justify-between rounded border border-slate-200 px-2 py-1"
                                    >
                                      <span>
                                        <span className="font-medium text-slate-700">
                                          {waiter.username}
                                        </span>
                                        {waiter.email && (
                                          <span className="ml-1 text-slate-400">
                                            · {waiter.email}
                                          </span>
                                        )}
                                      </span>
                                      <div className="flex gap-2">
                                        <button
                                          className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
                                          onClick={() =>
                                            handleEditWaiter(restaurant.id, branch.id, waiter)
                                          }
                                        >
                                          Edit
                                        </button>
                                        <button
                                          className="text-[11px] font-medium text-red-600 hover:text-red-700"
                                          onClick={() =>
                                            handleDeleteWaiter(restaurant.id, branch.id, waiter.id)
                                          }
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-slate-400">No waiters assigned.</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400">No branches yet.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

