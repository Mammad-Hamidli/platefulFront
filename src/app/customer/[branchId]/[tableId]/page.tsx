'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createApiClient } from '@/lib/api';
import { startCustomerSession, getCustomerMenu } from '@/lib/api/customer';
import { saveCustomerSession, getCustomerSession } from '@/lib/customer-session';
import type { CustomerMenuItem, CartItem } from '@/types/customer';

export default function CustomerMenuPage() {
  const params = useParams();
  const router = useRouter();
  const branchId = Number(params.branchId);
  const tableId = Number(params.tableId);

  const [menu, setMenu] = useState<CustomerMenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);

  const api = createApiClient(); // No auth token needed

  // Validate params
  useEffect(() => {
    if (!branchId || !tableId || isNaN(branchId) || isNaN(tableId)) {
      setError('Invalid branch or table ID');
      setLoading(false);
    }
  }, [branchId, tableId]);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (!branchId || !tableId || isNaN(branchId) || isNaN(tableId)) return;
    
    const storedCart = localStorage.getItem(`cart_${branchId}_${tableId}`);
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (err) {
        console.error('[CustomerMenu] Failed to load cart', err);
      }
    }
  }, [branchId, tableId]);

  useEffect(() => {
    if (!branchId || !tableId || isNaN(branchId) || isNaN(tableId)) return;

    const initializeSession = async () => {
      try {
        // Check if session already exists
        const existingSession = getCustomerSession();
        if (
          existingSession &&
          existingSession.branchId === branchId &&
          existingSession.tableId === tableId
        ) {
          setSessionStarted(true);
          await loadMenu();
          return;
        }

        // Start new session
        const sessionResponse = await startCustomerSession(api, {
          branchId,
          tableId,
        });

        saveCustomerSession({
          guestSessionId: sessionResponse.guestSessionId,
          restaurantId: sessionResponse.restaurantId,
          branchId,
          tableId,
          createdAt: new Date().toISOString(),
        });

        setSessionStarted(true);
        await loadMenu();
      } catch (err) {
        console.error('[CustomerMenu] Session error', err);
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to initialize session';
        setError(errorMessage);
        setLoading(false);
        setSessionStarted(false);
      }
    };

    void initializeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, tableId]);

  const loadMenu = async () => {
    if (!branchId || !tableId || isNaN(branchId) || isNaN(tableId)) return;
    
    try {
      setLoading(true);
      setError(null);
      const menuItems = await getCustomerMenu(api, branchId, tableId);
      // Filter available items and ensure data structure is correct
      const availableItems = (menuItems || []).filter((item) => 
        item && item.isAvailable !== false
      );
      setMenu(availableItems);
    } catch (err) {
      console.error('[CustomerMenu] Load error', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to load menu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: CustomerMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      const newCart = existing
        ? prev.map((i) =>
            i.menuItemId === item.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [
            ...prev,
            {
              menuItemId: item.id,
              name: item.name,
              priceCents: item.priceCents,
              quantity: 1,
            },
          ];
      // Save to localStorage
      localStorage.setItem(`cart_${branchId}_${tableId}`, JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (menuItemId: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItemId);
      const newCart =
        existing && existing.quantity > 1
          ? prev.map((i) =>
              i.menuItemId === menuItemId
                ? { ...i, quantity: i.quantity - 1 }
                : i
            )
          : prev.filter((i) => i.menuItemId !== menuItemId);
      // Save to localStorage
      localStorage.setItem(`cart_${branchId}_${tableId}`, JSON.stringify(newCart));
      return newCart;
    });
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const groupedMenu = menu.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, CustomerMenuItem[]>);

  if (!sessionStarted && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600">Initializing session...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-900">Error</h2>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">Menu</h1>
            <Link
              href={`/customer/${branchId}/${tableId}/cart`}
              className="relative inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Cart
              {getCartCount() > 0 && (
                <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-blue-600">
                  {getCartCount()}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {loading ? (
          <div className="text-center text-slate-500">Loading menu...</div>
        ) : menu.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
            No menu items available
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedMenu).map(([category, items]) => (
              <section key={category}>
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                  {category}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="mt-1 text-sm text-slate-600">
                              {item.description}
                            </p>
                          )}
                          <p className="mt-2 text-base font-semibold text-slate-900">
                            ${(item.priceCents / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

