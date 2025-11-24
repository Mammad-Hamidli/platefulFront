'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createApiClient } from '@/lib/api';
import { createCustomerOrder } from '@/lib/api/customer';
import { getCustomerSession } from '@/lib/customer-session';
import type { CartItem } from '@/types/customer';

export default function CustomerCartPage() {
  const params = useParams();
  const router = useRouter();
  const branchId = Number(params.branchId);
  const tableId = Number(params.tableId);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = createApiClient(); // No auth token needed

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem(`cart_${branchId}_${tableId}`);
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (err) {
        console.error('[Cart] Failed to load cart', err);
      }
    }
  }, [branchId, tableId]);

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem(`cart_${branchId}_${tableId}`, JSON.stringify(newCart));
  };

  const removeFromCart = (menuItemId: number) => {
    updateCart(cart.filter((item) => item.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    updateCart(
      cart.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    const session = getCustomerSession();
    if (!session) {
      setError('Session not found. Please go back to the menu.');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createCustomerOrder(api, {
        guestSessionId: session.guestSessionId,
        branchId,
        tableId,
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          qty: item.quantity,
        })),
      });

      // Clear cart
      updateCart([]);
      localStorage.removeItem(`cart_${branchId}_${tableId}`);

      // Redirect to checkout
      router.push(`/customer/${branchId}/${tableId}/checkout`);
    } catch (err) {
      console.error('[Cart] Submit error', err);
      setError(
        err instanceof Error ? err.message : 'Failed to submit order'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">Your cart is empty</h2>
          <Link
            href={`/customer/${branchId}/${tableId}`}
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">Your Cart</h1>
            <Link
              href={`/customer/${branchId}/${tableId}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Back to Menu
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.menuItemId}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    ${(item.priceCents / 100).toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.menuItemId)}
                    className="ml-2 text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-slate-900">Total</span>
            <span className="text-xl font-bold text-slate-900">
              ${(getTotal() / 100).toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleSubmitOrder}
            disabled={submitting}
            className="mt-4 w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting Order...' : 'Place Order'}
          </button>
        </div>
      </main>
    </div>
  );
}

