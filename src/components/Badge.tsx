import React from 'react';
import { OrderStatus } from '../types';

interface BadgeProps {
  status: OrderStatus | string;
  className?: string;
}

const statusColors: Record<string, string> = {
  ORDERED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-yellow-100 text-yellow-800',
  PREPARED_WAITING: 'bg-orange-100 text-orange-800',
  SERVED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
};

