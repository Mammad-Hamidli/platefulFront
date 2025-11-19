import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menuApi } from '../../api/menu';
import { Card } from '../../components/Card';
import type { MenuItem } from '../../types';
import { useAuthStore } from '../../store/authStore';

export const MenuPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { user, isAuthenticated } = useAuthStore();
  const restaurantId = user?.restaurantId ?? undefined;
  const branchId = user?.branchId ?? undefined;
  const canLoadMenu = isAuthenticated;

  const {
    data: menuItems = [],
    isLoading,
    isFetching,
    isError,
  } = useQuery<MenuItem[]>({
    queryKey: ['menu', restaurantId, branchId],
    queryFn: () => menuApi.getMenu(restaurantId, branchId),
    enabled: canLoadMenu,
  });

  const categories = Array.from(new Set(menuItems.map(item => item.category).filter(Boolean))) as string[];
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">
          Please sign in to view the menu.
        </div>
      </div>
    );
  }

  if (isLoading || isFetching) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading menu...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error loading menu. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Menu</h1>

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center">No menu items available.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-t-lg mb-4"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              {item.description && (
                <p className="text-gray-600 mb-4">{item.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-600">${item.price.toFixed(2)}</span>
                {!item.available && (
                  <span className="text-sm text-red-600">Unavailable</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

