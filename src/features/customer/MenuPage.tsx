import React, { useState } from 'react';
import { useMenu } from '../../hooks/useMenu';
import { useOrderStore } from '../../store/orderStore';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { MenuItem } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export const MenuPage: React.FC = () => {
  const { user } = useAuthStore();
  const { menu, isLoading } = useMenu(user?.restaurantId || 0, user?.branchId);
  const { addToCart } = useOrderStore();
  const { showToast } = useUIStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: string[] = ['all', ...Array.from(new Set(menu.map((item) => item.category as string)))];

  const filteredMenu = selectedCategory === 'all'
    ? menu
    : menu.filter((item) => item.category === selectedCategory);

  const handleAddToCart = (item: MenuItem) => {
    if (!item.available) {
      showToast('This item is currently unavailable', 'warning');
      return;
    }
    addToCart({
      menuItemId: item.id,
      quantity: 1,
      price: item.price,
    });
    showToast(`${item.name} added to cart`, 'success');
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">Menu</h1>

      {/* Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMenu.map((item) => (
          <Card key={item.id} hover>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                {item.description && (
                  <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                )}
                <p className="text-blue-600 font-bold mt-2">${item.price.toFixed(2)}</p>
                {!item.available && (
                  <span className="text-red-500 text-sm">Unavailable</span>
                )}
              </div>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded ml-4"
                />
              )}
            </div>
            <Button
              variant="primary"
              size="sm"
              className="mt-3 w-full"
              onClick={() => handleAddToCart(item)}
              disabled={!item.available}
            >
              Add to Cart
            </Button>
          </Card>
        ))}
      </div>

      {filteredMenu.length === 0 && (
        <div className="text-center py-8 text-gray-500">No items in this category</div>
      )}
    </div>
  );
};

