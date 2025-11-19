import axiosInstance from './axiosInstance';
import { AnalyticsData, Branch, User, Restaurant } from '../types';

export const getSuperAdminBranches = async (): Promise<Branch[]> => {
  const response = await axiosInstance.get<Branch[]>('/admin/branches');
  return response.data;
};

export const getSuperAdminUsers = async (): Promise<User[]> => {
  const response = await axiosInstance.get<User[]>('/admin/users');
  return response.data;
};

export const getSuperAdminRestaurants = async (): Promise<Restaurant[]> => {
  const response = await axiosInstance.get<Restaurant[]>('/admin/restaurants');
  return response.data;
};

export const getReports = async (startDate?: string, endDate?: string): Promise<AnalyticsData> => {
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await axiosInstance.get<AnalyticsData>('/admin/reports', { params });
  return response.data;
};

export const createRestaurant = async (restaurant: Omit<Restaurant, 'id'>): Promise<Restaurant> => {
  const response = await axiosInstance.post<Restaurant>('/admin/restaurants', restaurant);
  return response.data;
};

export const updateRestaurant = async (
  restaurantId: number,
  updates: Partial<Restaurant>
): Promise<Restaurant> => {
  const response = await axiosInstance.put<Restaurant>(`/admin/restaurants/${restaurantId}`, updates);
  return response.data;
};

export const deleteRestaurant = async (restaurantId: number): Promise<void> => {
  await axiosInstance.delete(`/admin/restaurants/${restaurantId}`);
};

