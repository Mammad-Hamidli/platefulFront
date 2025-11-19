import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrders';
import { createPayment } from '../../api/payments';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PaymentMethod } from '../../types';
import { useUIStore } from '../../store/uiStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { order, isLoading } = useOrder(Number(orderId));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [amount, setAmount] = useState<string>('');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const paymentMutation = useMutation({
    mutationFn: ({ method, amount }: { method: PaymentMethod; amount: number }) =>
      createPayment(Number(orderId), amount, method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      showToast('Payment processed successfully', 'success');
      navigate('/waiter');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Payment failed', 'error');
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">Order not found</p>
        <Button variant="outline" onClick={() => navigate('/waiter')} className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  const remainingAmount = order.totalAmount;
  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setAmount(value);
    } else if (value === '') {
      setAmount('');
    }
  };

  const handleSubmit = () => {
    const paymentAmount = amount ? parseFloat(amount) : remainingAmount;
    if (paymentAmount <= 0) {
      showToast('Payment amount must be greater than 0', 'error');
      return;
    }
    if (paymentAmount > remainingAmount) {
      showToast('Payment amount cannot exceed order total', 'error');
      return;
    }
    paymentMutation.mutate({ method: paymentMethod, amount: paymentAmount });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Process Payment</h1>

      <Card className="mb-4">
        <h2 className="font-semibold mb-2">Order #{order.id}</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Order Total:</span>
            <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <h2 className="font-semibold mb-3">Payment Method</h2>
        <div className="space-y-2">
          {(['CASH', 'CARD', 'ONLINE'] as PaymentMethod[]).map((method) => (
            <label
              key={method}
              className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={paymentMethod === method}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="mr-3"
              />
              <span>{method.charAt(0) + method.slice(1).toLowerCase()}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card className="mb-4">
        <h2 className="font-semibold mb-3">Payment Amount</h2>
        <div className="space-y-2">
          <input
            type="number"
            step="0.01"
            min="0"
            max={remainingAmount}
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder={`${remainingAmount.toFixed(2)}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p className="text-sm text-gray-500">
            Remaining: ${remainingAmount.toFixed(2)}
          </p>
        </div>
      </Card>

      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          isLoading={paymentMutation.isPending}
        >
          Process Payment
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => navigate(`/waiter/orders/${orderId}`)}
        >
          Back to Order
        </Button>
      </div>
    </div>
  );
};

