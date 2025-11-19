import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useNavigate } from 'react-router-dom';

export const SuperAdminDashboard = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {user?.username}</span>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/superadmin/branches')}>
          <h3 className="text-xl font-semibold mb-2">Branches</h3>
          <p className="text-gray-600">Manage all branches</p>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/superadmin/users')}>
          <h3 className="text-xl font-semibold mb-2">Users</h3>
          <p className="text-gray-600">Manage users and permissions</p>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/restaurants')}>
          <h3 className="text-xl font-semibold mb-2">Restaurants</h3>
          <p className="text-gray-600">Manage restaurants</p>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/orders')}>
          <h3 className="text-xl font-semibold mb-2">Orders</h3>
          <p className="text-gray-600">View all orders</p>
        </Card>
      </div>
    </div>
  );
};

