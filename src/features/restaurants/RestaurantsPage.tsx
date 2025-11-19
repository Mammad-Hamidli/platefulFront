import { useQuery } from '@tanstack/react-query';
import { restaurantsApi } from '../../api/restaurants';
import { Card } from '../../components/Card';

export const RestaurantsPage = () => {
  const { data: restaurants = [], isLoading, error } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => restaurantsApi.getRestaurants(),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading restaurants...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Error loading restaurants. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Restaurants</h1>

      {restaurants.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center">No restaurants found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
              {restaurant.description && (
                <p className="text-gray-600 mb-4">{restaurant.description}</p>
              )}
              {restaurant.address && (
                <p className="text-sm text-gray-500">{restaurant.address}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

