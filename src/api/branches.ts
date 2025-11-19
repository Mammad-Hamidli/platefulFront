import axiosInstance from './axiosInstance';
import { Branch } from '../types';

export const getBranches = async (restaurantId?: number): Promise<Branch[]> => {
  const params: any = {};
  if (restaurantId) params.restaurantId = restaurantId;
  const response = await axiosInstance.get<Branch[]>('/branches', { params });
  return response.data;
};

export const getBranch = async (branchId: number): Promise<Branch> => {
  const response = await axiosInstance.get<Branch>(`/branches/${branchId}`);
  return response.data;
};

export const createBranch = async (branch: Omit<Branch, 'id'>): Promise<Branch> => {
  const response = await axiosInstance.post<Branch>('/branches', branch);
  return response.data;
};

export const updateBranch = async (branchId: number, updates: Partial<Branch>): Promise<Branch> => {
  const response = await axiosInstance.put<Branch>(`/branches/${branchId}`, updates);
  return response.data;
};

export const deleteBranch = async (branchId: number): Promise<void> => {
  await axiosInstance.delete(`/branches/${branchId}`);
};

