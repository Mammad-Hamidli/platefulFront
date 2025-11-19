import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrders';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { useKitchenOrders } from '../../hooks/useOrders';

export const KitchenOrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { order, isLoading } = useOrder(Number(orderId));
  const { acceptOrder, markReady } = useKitchenOrders();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">Order not found</p>
        <Button variant="outline" onClick={() => navigate('/kitchen')} className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  const canAccept = order.status === 'ORDERED';
  const canMarkReady = order.status === 'PREPARING';

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        <Badge status={order.status} />
      </div>

      <Card className="mb-4">
        <h2 className="font-semibold mb-3">Order Items</h2>
        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start pb-3 border-b last:border-0">
              <div>
                <p className="font-medium">
                  {item.quantity}x {item.menuItem?.name || `Item #${item.menuItemId}`}
                </p>
                {item.notes && (
                  <p className="text-sm text-gray-600 mt-1">Note: {item.notes}</p>
                )}
              </div>
              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t flex justify-between">
          <span className="font-semibold text-lg">Total:</span>
          <span className="font-bold text-xl text-blue-600">${order.totalAmount.toFixed(2)}</span>
        </div>
      </Card>

      {order.notes && (
        <Card className="mb-4">
          <h3 className="font-semibold mb-2">Order Notes</h3>
          <p className="text-gray-700">{order.notes}</p>
        </Card>
      )}

      {order.logs && order.logs.length > 0 && (
        <Card className="mb-4">
          <h3 className="font-semibold mb-3">Order History</h3>
          <div className="space-y-2">
            {order.logs.map((log) => (
              <div key={log.id} className="text-sm">
                <Badge status={log.status} />
                <span className="ml-2 text-gray-600">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                {log.notes && (
                  <p className="text-gray-500 mt-1 ml-6">{log.notes}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {canAccept && (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => acceptOrder(order.id, { onSuccess: () => navigate('/kitchen') })}
          >
            Accept Order
          </Button>
        )}
        {canMarkReady && (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => markReady(order.id, { onSuccess: () => navigate('/kitchen') })}
          >
            Mark as Ready
          </Button>
        )}
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => navigate('/kitchen')}
        >
          Back to Orders
        </Button>
      </div>
    </div>
  );
};

