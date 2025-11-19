import api from './apiClient';
import type { MenuItem } from '../types';

export const menuApi = {
  getMenu: async (restaurantId?: number, branchId?: number): Promise<MenuItem[]> => {
    const params: Record<string, number> = {};

    if (typeof restaurantId === 'number') {
      params.restaurantId = restaurantId;
    }

    if (typeof branchId === 'number') {
      params.branchId = branchId;
    }

    const response = await api.get<MenuItem[]>('/menu', { params });
    return response.data;
  },

  getMenuItem: async (id: number): Promise<MenuItem> => {
    const response = await api.get<MenuItem>(`/menu/${id}`);
    return response.data;
  },
};

