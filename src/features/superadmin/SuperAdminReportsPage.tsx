import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReports } from '../../api/superadmin';
import { Card } from '../../components/Card';
import { AnalyticsWidgets } from './AnalyticsWidgets';
import { AnalyticsData } from '../../types';

export const SuperAdminReportsPage: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { data: analytics, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: ['superadmin', 'reports', startDate, endDate],
    queryFn: () => getReports(startDate || undefined, endDate || undefined),
  });

  const handleFilter = () => {
    refetch();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Filter Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleFilter}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </Card>

      <AnalyticsWidgets analytics={analytics} isLoading={isLoading} />
    </div>
  );
};

