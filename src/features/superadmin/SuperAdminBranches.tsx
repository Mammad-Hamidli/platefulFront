import { useQuery } from '@tanstack/react-query';
import { restaurantsApi } from '../../api/restaurants';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useNavigate } from 'react-router-dom';

export const SuperAdminBranches = () => {
  const navigate = useNavigate();
  
  const { data: branches = [], isLoading, error } = useQuery({
    queryKey: ['branches'],
    queryFn: () => restaurantsApi.getBranches(),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading branches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Error loading branches. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Branches</h1>
        <Button onClick={() => navigate('/superadmin/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {branches.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center">No branches found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <Card key={branch.id} className="hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{branch.name}</h3>
              {branch.address && (
                <p className="text-gray-600 mb-2">{branch.address}</p>
              )}
              {branch.phone && (
                <p className="text-sm text-gray-500">Phone: {branch.phone}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

