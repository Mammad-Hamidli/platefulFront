import axiosInstance from './axiosInstance';
import { Table } from '../types';

export const getTables = async (restaurantId: number, branchId?: number): Promise<Table[]> => {
  const params: any = { restaurantId };
  if (branchId) params.branchId = branchId;
  const response = await axiosInstance.get<Table[]>('/tables', { params });
  return response.data;
};

export const getTable = async (tableId: number): Promise<Table> => {
  const response = await axiosInstance.get<Table>(`/tables/${tableId}`);
  return response.data;
};

export const createTable = async (table: Omit<Table, 'id'>): Promise<Table> => {
  const response = await axiosInstance.post<Table>('/tables', table);
  return response.data;
};

export const updateTable = async (tableId: number, updates: Partial<Table>): Promise<Table> => {
  const response = await axiosInstance.put<Table>(`/tables/${tableId}`, updates);
  return response.data;
};

export const deleteTable = async (tableId: number): Promise<void> => {
  await axiosInstance.delete(`/tables/${tableId}`);
};

export const getQRCode = async (restaurantId: number, tableId: number): Promise<{ qrCode: string }> => {
  const response = await axiosInstance.get<{ qrCode: string }>(`/qr/${restaurantId}/${tableId}`);
  return response.data;
};

