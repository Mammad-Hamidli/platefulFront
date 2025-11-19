import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWaiterOrders } from '../../hooks/useOrders';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useAuthStore } from '../../store/authStore';
import { Order } from '../../types';

export const WaiterOrdersPage: React.FC = () => {
  const { user } = useAuthStore();
  const { orders, isLoading } = useWaiterOrders(user?.branchId);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Orders Ready to Serve</h1>

      <div className="space-y-4">
        {orders.map((order: Order) => (
          <Card
            key={order.id}
            hover
            onClick={() => navigate(`/waiter/orders/${order.id}`)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                <p className="text-sm text-gray-500">
                  Table: {order.sessionId} | {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge status={order.status} />
            </div>

            <div className="mt-3 space-y-1">
              {order.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="text-sm">
                  {item.quantity}x {item.menuItem?.name || `Item #${item.menuItemId}`}
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="text-sm text-gray-500">
                  +{order.items.length - 3} more items
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-blue-600">${order.totalAmount.toFixed(2)}</span>
            </div>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8 text-gray-500">No orders ready to serve</div>
      )}
    </div>
  );
};

