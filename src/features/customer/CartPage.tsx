import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../store/orderStore';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useMenu } from '../../hooks/useMenu';
import { useAuthStore } from '../../store/authStore';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateCartItem, getCartTotal, notes, setNotes } = useOrderStore();
  const { user } = useAuthStore();
  const { menu } = useMenu(user?.restaurantId || 0, user?.branchId);
  const navigate = useNavigate();

  const getMenuItem = (menuItemId: number) => {
    return menu.find((item) => item.id === menuItemId);
  };

  if (cart.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <Button variant="primary" onClick={() => navigate('/menu')}>
          Browse Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      <div className="space-y-4 mb-4">
        {cart.map((item) => {
          const menuItem = getMenuItem(item.menuItemId);
          if (!menuItem) return null;

          return (
            <Card key={item.menuItemId}>
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-semibold">{menuItem.name}</h3>
                  <p className="text-gray-600 text-sm">${item.price.toFixed(2)} each</p>
                  {item.notes && (
                    <p className="text-gray-500 text-xs mt-1">Note: {item.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateCartItem(item.menuItemId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="font-semibold w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateCartItem(item.menuItemId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.menuItemId)}
                    className="text-red-600 ml-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="text-right mt-2 font-semibold">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </Card>
          );
        })}
      </div>

      <Card className="mb-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Any special instructions..."
          />
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-bold text-blue-600">${getCartTotal().toFixed(2)}</span>
        </div>
      </Card>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => navigate('/checkout')}
      >
        Proceed to Checkout
      </Button>
    </div>
  );
};

