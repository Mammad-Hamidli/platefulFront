import React from 'react';
import { Card } from '../../components/Card';
import { AnalyticsData } from '../../types';

interface AnalyticsWidgetsProps {
  analytics?: AnalyticsData;
  isLoading?: boolean;
}

export const AnalyticsWidgets: React.FC<AnalyticsWidgetsProps> = ({
  analytics,
  isLoading,
}) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-8 text-gray-500">No analytics data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Orders by Status */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Orders by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(analytics.ordersByStatus || {}).map(([status, count]) => (
            <div key={status} className="text-center">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm text-gray-600">{status.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Revenue Chart */}
      {analytics.revenueByDate && analytics.revenueByDate.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Revenue Over Time</h2>
          <div className="space-y-2">
            {analytics.revenueByDate.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.date}</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full"
                      style={{
                        width: `${
                          (item.revenue / Math.max(...analytics.revenueByDate.map((r) => r.revenue))) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-20 text-right">
                    ${item.revenue.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Orders</h3>
          <p className="text-3xl font-bold">{analytics.totalOrders || 0}</p>
        </Card>
        <Card>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold">${analytics.totalRevenue?.toFixed(2) || '0.00'}</p>
        </Card>
        <Card>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Active Sessions</h3>
          <p className="text-3xl font-bold">{analytics.activeSessions || 0}</p>
        </Card>
        <Card>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Avg Order Value</h3>
          <p className="text-3xl font-bold">${analytics.averageOrderValue?.toFixed(2) || '0.00'}</p>
        </Card>
      </div>
    </div>
  );
};

