import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../store/orderStore';
import { useSessionStore } from '../../store/sessionStore';
import { useOrders } from '../../hooks/useOrders';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useUIStore } from '../../store/uiStore';

export const CheckoutPage: React.FC = () => {
  const { cart, getCartTotal, notes, clearCart } = useOrderStore();
  const { sessionId } = useSessionStore();
  const { createOrder, isCreating } = useOrders(sessionId || undefined);
  const { showToast } = useUIStore();
  const navigate = useNavigate();

  const handlePlaceOrder = () => {
    if (!sessionId) {
      showToast('No active session. Please scan QR code first.', 'error');
      navigate('/');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty', 'warning');
      return;
    }

    createOrder(
      { items: cart, notes },
      {
        onSuccess: () => {
          clearCart();
          navigate('/order-status');
        },
      }
    );
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <Card className="mb-4">
        <h2 className="font-semibold mb-2">Order Summary</h2>
        <div className="space-y-2 mb-4">
          {cart.map((item) => (
            <div key={item.menuItemId} className="flex justify-between text-sm">
              <span>
                {item.quantity}x Item #{item.menuItemId}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        {notes && (
          <div className="mb-4 p-2 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <strong>Notes:</strong> {notes}
            </p>
          </div>
        )}
        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-bold text-blue-600">${getCartTotal().toFixed(2)}</span>
        </div>
      </Card>

      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handlePlaceOrder}
          isLoading={isCreating}
        >
          Place Order
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => navigate('/cart')}
        >
          Back to Cart
        </Button>
      </div>
    </div>
  );
};

