import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMenu,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../api/menu';
import { MenuItem } from '../types';
import { useUIStore } from '../store/uiStore';

export const useMenu = (restaurantId: number, branchId?: number) => {
  const { data: menu = [], isLoading } = useQuery({
    queryKey: ['menu', restaurantId, branchId],
    queryFn: () => getMenu(restaurantId, branchId),
    enabled: !!restaurantId,
  });

  return { menu, isLoading };
};

export const useMenuItem = (itemId: number) => {
  const { data: item, isLoading } = useQuery({
    queryKey: ['menu', itemId],
    queryFn: () => getMenuItem(itemId),
    enabled: !!itemId,
  });

  return { item, isLoading };
};

export const useMenuMutations = () => {
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      showToast('Menu item created successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to create menu item', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<MenuItem> }) =>
      updateMenuItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      showToast('Menu item updated successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to update menu item', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      showToast('Menu item deleted successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to delete menu item', 'error');
    },
  });

  return {
    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    deleteItem: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

