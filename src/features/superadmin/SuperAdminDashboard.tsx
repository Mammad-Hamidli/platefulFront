import React from 'react';
import { Card } from '../../components/Card';
import { useQuery } from '@tanstack/react-query';
import { getReports } from '../../api/superadmin';
import { AnalyticsWidgets } from './AnalyticsWidgets';

export const SuperAdminDashboard: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['superadmin', 'analytics'],
    queryFn: () => getReports(),
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Orders</h3>
          <p className="text-3xl font-bold">{analytics?.totalOrders || 0}</p>
        </Card>
        <Card>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold">${analytics?.totalRevenue?.toFixed(2) || '0.00'}</p>
        </Card>
        <Card>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Active Sessions</h3>
          <p className="text-3xl font-bold">{analytics?.activeSessions || 0}</p>
        </Card>
        <Card>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Avg Order Value</h3>
          <p className="text-3xl font-bold">${analytics?.averageOrderValue?.toFixed(2) || '0.00'}</p>
        </Card>
      </div>

      <AnalyticsWidgets analytics={analytics} isLoading={isLoading} />
    </div>
  );
};

