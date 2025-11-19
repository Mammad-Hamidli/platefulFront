import React, { useEffect } from 'react';
import { useSessionStore } from '../../store/sessionStore';
import { useOrders } from '../../hooks/useOrders';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Order } from '../../types';

export const OrderStatusPage: React.FC = () => {
  const { sessionId } = useSessionStore();
  const { orders, isLoading } = useOrders(sessionId || undefined);

  useEffect(() => {
    // Auto-refresh is handled by the hook's refetchInterval
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500 mb-4">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>

      <div className="space-y-4">
        {orders.map((order: Order) => (
          <Card key={order.id}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">Order #{order.id}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge status={order.status} />
            </div>

            <div className="mt-4 space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.menuItem?.name || `Item #${item.menuItemId}`}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="mt-3 p-2 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">
                  <strong>Notes:</strong> {order.notes}
                </p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t flex justify-between">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-blue-600">${order.totalAmount.toFixed(2)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

