import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createOrder,
  getOrder,
  getSessionOrders,
  updateOrderStatus,
  getKitchenOrders,
  acceptOrder,
  markOrderReady,
  getWaiterOrders,
  serveOrder,
} from '../api/orders';
import { OrderItem, OrderStatus } from '../types';
import { useUIStore } from '../store/uiStore';

export const useOrders = (sessionId?: number) => {
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', 'session', sessionId],
    queryFn: () => getSessionOrders(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const createOrderMutation = useMutation({
    mutationFn: ({ items, notes }: { items: OrderItem[]; notes?: string }) =>
      createOrder(sessionId!, items, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      showToast('Order created successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to create order', 'error');
    },
  });

  return {
    orders,
    isLoading,
    createOrder: createOrderMutation.mutate,
    isCreating: createOrderMutation.isPending,
  };
};

export const useOrder = (orderId: number) => {
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
    refetchInterval: 5000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, notes }: { status: OrderStatus; notes?: string }) =>
      updateOrderStatus(orderId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      showToast('Order status updated', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to update order', 'error');
    },
  });

  return {
    order,
    isLoading,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
};

export const useKitchenOrders = (branchId?: number) => {
  const queryClient = useQueryClient();
  
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', 'kitchen', branchId],
    queryFn: () => getKitchenOrders(branchId),
    refetchInterval: 5000,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'kitchen'] });
    },
  });

  const readyMutation = useMutation({
    mutationFn: markOrderReady,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'kitchen'] });
    },
  });

  return {
    orders,
    isLoading,
    acceptOrder: (orderId: number, options?: any) => acceptMutation.mutate(orderId, options),
    markReady: (orderId: number, options?: any) => readyMutation.mutate(orderId, options),
  };
};

export const useWaiterOrders = (branchId?: number) => {
  const queryClient = useQueryClient();
  
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', 'waiter', branchId],
    queryFn: () => getWaiterOrders(branchId),
    refetchInterval: 5000,
  });

  const serveMutation = useMutation({
    mutationFn: serveOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'waiter'] });
    },
  });

  return {
    orders,
    isLoading,
    serveOrder: (orderId: number, options?: any) => serveMutation.mutate(orderId, options),
  };
};

