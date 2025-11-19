import axiosInstance from './axiosInstance';
import { User } from '../types';

export const getUsers = async (restaurantId?: number, branchId?: number): Promise<User[]> => {
  const params: any = {};
  if (restaurantId) params.restaurantId = restaurantId;
  if (branchId) params.branchId = branchId;
  const response = await axiosInstance.get<User[]>('/users', { params });
  return response.data;
};

export const getUser = async (userId: number): Promise<User> => {
  const response = await axiosInstance.get<User>(`/users/${userId}`);
  return response.data;
};

export const createUser = async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  const response = await axiosInstance.post<User>('/users', user);
  return response.data;
};

export const updateUser = async (userId: number, updates: Partial<User>): Promise<User> => {
  const response = await axiosInstance.put<User>(`/users/${userId}`, updates);
  return response.data;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await axiosInstance.delete(`/users/${userId}`);
};

