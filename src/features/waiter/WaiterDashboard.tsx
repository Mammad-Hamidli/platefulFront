import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders';

export const WaiterDashboard = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getOrders(),
  });

  const activeOrders = orders.filter(order => 
    ['PENDING', 'PREPARING', 'READY'].includes(order.status)
  );

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Waiter Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {user?.username}</span>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
          {activeOrders.length === 0 ? (
            <p className="text-gray-500">No active orders</p>
          ) : (
            <div className="space-y-2">
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <span>Order #{order.id} - Table {order.tableId || 'N/A'}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    order.status === 'READY' ? 'bg-green-100 text-green-800' :
                    order.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/orders')}>
          <h3 className="text-xl font-semibold mb-2">All Orders</h3>
          <p className="text-gray-600">View all orders</p>
        </Card>
      </div>
    </div>
  );
};

