import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKitchenOrders } from '../../hooks/useOrders';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useAuthStore } from '../../store/authStore';
import { Order } from '../../types';

export const KitchenOrdersPage: React.FC = () => {
  const { user } = useAuthStore();
  const { orders, isLoading } = useKitchenOrders(user?.branchId);
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
      <h1 className="text-2xl font-bold mb-4">Kitchen Orders</h1>

      <div className="space-y-4">
        {orders.map((order: Order) => (
          <Card
            key={order.id}
            hover
            onClick={() => navigate(`/kitchen/orders/${order.id}`)}
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

            {order.notes && (
              <div className="mt-3 p-2 bg-yellow-50 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Notes:</strong> {order.notes}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8 text-gray-500">No orders in kitchen</div>
      )}
    </div>
  );
};

