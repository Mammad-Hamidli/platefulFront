import React from 'react';
import { Card } from '../../components/Card';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../store/authStore';

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'stats', user?.restaurantId, user?.branchId],
    queryFn: async () => {
      const params: any = {};
      if (user?.restaurantId) params.restaurantId = user.restaurantId;
      if (user?.branchId) params.branchId = user.branchId;
      const response = await axiosInstance.get('/admin/dashboard', { params });
      return response.data;
    },
    enabled: !!user,
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Orders</h3>
          <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
        </Card>
        <Card>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Active Sessions</h3>
          <p className="text-3xl font-bold">{stats?.activeSessions || 0}</p>
        </Card>
        <Card>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Today's Revenue</h3>
          <p className="text-3xl font-bold">${stats?.todayRevenue?.toFixed(2) || '0.00'}</p>
        </Card>
        <Card>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Pending Orders</h3>
          <p className="text-3xl font-bold">{stats?.pendingOrders || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-2">
            {stats?.recentOrders?.map((order: any) => (
              <div key={order.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="font-semibold">${order.totalAmount.toFixed(2)}</p>
              </div>
            ))}
            {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Table Status</h2>
          <div className="grid grid-cols-2 gap-2">
            {stats?.tableStatus?.map((table: any) => (
              <div
                key={table.id}
                className={`p-3 rounded ${
                  table.isAvailable ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <p className="font-medium">Table {table.number}</p>
                <p className="text-sm text-gray-600">
                  {table.isAvailable ? 'Available' : 'Occupied'}
                </p>
              </div>
            ))}
            {(!stats?.tableStatus || stats.tableStatus.length === 0) && (
              <p className="text-gray-500 col-span-2 text-center py-4">No tables</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

