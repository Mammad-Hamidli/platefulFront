import axiosInstance from './axiosInstance';
import { MenuItem } from '../types';

export const getMenu = async (restaurantId: number, branchId?: number): Promise<MenuItem[]> => {
  const params: any = { restId: restaurantId };
  if (branchId) params.branchId = branchId;
  const response = await axiosInstance.get<MenuItem[]>('/menu', { params });
  return response.data;
};

export const getMenuItem = async (itemId: number): Promise<MenuItem> => {
  const response = await axiosInstance.get<MenuItem>(`/menu/${itemId}`);
  return response.data;
};

export const createMenuItem = async (item: Omit<MenuItem, 'id' | 'createdAt'>): Promise<MenuItem> => {
  const response = await axiosInstance.post<MenuItem>('/menu', item);
  return response.data;
};

export const updateMenuItem = async (
  itemId: number,
  updates: Partial<MenuItem>
): Promise<MenuItem> => {
  const response = await axiosInstance.put<MenuItem>(`/menu/${itemId}`, updates);
  return response.data;
};

export const deleteMenuItem = async (itemId: number): Promise<void> => {
  await axiosInstance.delete(`/menu/${itemId}`);
};

