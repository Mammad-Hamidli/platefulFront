'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createApiClient } from '@/lib/api';
import { getKitchenOrders, acceptOrder, prepareOrder, readyOrder } from '@/lib/api/kitchen';
import type { KitchenOrder } from '@/types/kitchen';

type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY_TO_SERVE' | 'COMPLETED';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-200',
  PREPARING: 'bg-orange-100 text-orange-800 border-orange-200',
  READY_TO_SERVE: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-slate-100 text-slate-800 border-slate-200',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY_TO_SERVE: 'Ready to Serve',
  COMPLETED: 'Completed',
};

export default function KitchenDashboardPage() {
  const params = useParams();
  const branchId = Number(params.branchId);

  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<Set<number>>(new Set());

  const api = createApiClient(); // No auth token needed

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getKitchenOrders(api, branchId);
      // Filter out completed orders
      setOrders(data.filter((order) => order.status !== 'COMPLETED'));
    } catch (err) {
      console.error('[Kitchen] Load error', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      void loadOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [branchId]);

  const handleAccept = async (orderId: number) => {
    setUpdating((prev) => new Set(prev).add(orderId));
    try {
      await acceptOrder(api, orderId);
      await loadOrders();
    } catch (err) {
      console.error('[Kitchen] Accept error', err);
      setError(err instanceof Error ? err.message : 'Failed to accept order');
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const handlePrepare = async (orderId: number) => {
    setUpdating((prev) => new Set(prev).add(orderId));
    try {
      await prepareOrder(api, orderId);
      await loadOrders();
    } catch (err) {
      console.error('[Kitchen] Prepare error', err);
      setError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const handleReady = async (orderId: number) => {
    setUpdating((prev) => new Set(prev).add(orderId));
    try {
      await readyOrder(api, orderId);
      await loadOrders();
    } catch (err) {
      console.error('[Kitchen] Ready error', err);
      setError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Kitchen Dashboard</h1>
              <p className="text-sm text-slate-600">Branch ID: {branchId}</p>
            </div>
            <button
              onClick={() => void loadOrders()}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && orders.length === 0 ? (
          <div className="text-center text-slate-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
            No active orders
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => {
              const isUpdating = updating.has(order.orderId);
              const status = order.status as OrderStatus;

              return (
                <div
                  key={order.orderId}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Order #{order.orderId}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Table {order.tableNumber ?? order.tableId}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatTime(order.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLORS[status]}`}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                  </div>

                  <div className="mb-4 space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-700">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium text-slate-900">
                          {formatPrice(item.priceCents * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4 border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">Total</span>
                      <span className="text-lg font-bold text-slate-900">
                        {formatPrice(order.totalCents)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {status === 'PENDING' && (
                      <button
                        onClick={() => void handleAccept(order.orderId)}
                        disabled={isUpdating}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating ? 'Processing...' : 'Accept Order'}
                      </button>
                    )}

                    {status === 'ACCEPTED' && (
                      <button
                        onClick={() => void handlePrepare(order.orderId)}
                        disabled={isUpdating}
                        className="w-full rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating ? 'Processing...' : 'Start Preparing'}
                      </button>
                    )}

                    {status === 'PREPARING' && (
                      <button
                        onClick={() => void handleReady(order.orderId)}
                        disabled={isUpdating}
                        className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating ? 'Processing...' : 'Mark as Ready'}
                      </button>
                    )}

                    {status === 'READY_TO_SERVE' && (
                      <div className="rounded-lg bg-green-50 px-4 py-2 text-center text-sm font-medium text-green-800">
                        Ready for Service
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

