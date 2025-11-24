'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createApiClient } from '@/lib/api';
import { endCustomerSession } from '@/lib/api/customer';
import { getCustomerSession, clearCustomerSession } from '@/lib/customer-session';

export default function CustomerCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const branchId = Number(params.branchId);
  const tableId = Number(params.tableId);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const api = createApiClient(); // No auth token needed

  useEffect(() => {
    const session = getCustomerSession();
    if (!session) {
      router.push(`/customer/${branchId}/${tableId}`);
    }
  }, [branchId, tableId, router]);

  const handlePayment = async () => {
    const session = getCustomerSession();
    if (!session) {
      setError('Session not found');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // End the session (this marks it as completed and clears cart data)
      await endCustomerSession(api, session.guestSessionId);

      // Clear local session
      clearCustomerSession();
      localStorage.removeItem(`cart_${branchId}_${tableId}`);

      setCompleted(true);
    } catch (err) {
      console.error('[Checkout] Payment error', err);
      setError(
        err instanceof Error ? err.message : 'Failed to process payment'
      );
    } finally {
      setProcessing(false);
    }
  };

  if (completed) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-4 text-6xl">✓</div>
          <h2 className="text-2xl font-bold text-slate-900">Payment Successful!</h2>
          <p className="mt-2 text-slate-600">
            Thank you for your order. Your session has ended.
          </p>
          <button
            onClick={() => {
              clearCustomerSession();
              router.push(`/customer/${branchId}/${tableId}`);
            }}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start New Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900">Checkout</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Payment</h2>
          <p className="mb-4 text-sm text-slate-600">
            Please complete your payment to finalize the order.
          </p>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <label className="block text-sm font-medium text-slate-700">
                Payment Method
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                defaultValue="cash"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile Payment</option>
              </select>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing ? 'Processing...' : 'Complete Payment'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

