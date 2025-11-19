import api from './apiClient';
import type { Restaurant, Branch } from '../types';

export const restaurantsApi = {
  getRestaurants: async (): Promise<Restaurant[]> => {
    const response = await api.get<Restaurant[]>('/restaurants');
    return response.data;
  },

  getRestaurant: async (id: number): Promise<Restaurant> => {
    const response = await api.get<Restaurant>(`/restaurants/${id}`);
    return response.data;
  },

  getBranches: async (restaurantId?: number): Promise<Branch[]> => {
    const url = restaurantId ? `/restaurants/${restaurantId}/branches` : '/branches';
    const response = await api.get<Branch[]>(url);
    return response.data;
  },
};

