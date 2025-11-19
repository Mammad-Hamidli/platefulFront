import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useNavigate } from 'react-router-dom';

export const SuperAdminUsers = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <Button onClick={() => navigate('/superadmin/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <p className="text-gray-500 text-center">
          User management interface. 
          {/* TODO: Implement user management API calls when backend is ready */}
        </p>
      </Card>
    </div>
  );
};

