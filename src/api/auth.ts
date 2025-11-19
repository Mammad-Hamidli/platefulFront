import axiosInstance from './axiosInstance';
import { AuthResponse, User } from '../types';

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/login', {
    username,
    password,
  });
  return response.data;
};

export const register = async (
  username: string,
  email: string,
  password: string,
  role: string,
  restaurantId?: number
): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/register', {
    username,
    email,
    password,
    role,
    restaurantId,
  });
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await axiosInstance.get<User>('/auth/me');
  return response.data;
};

export const logout = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout');
};

