import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from './env';

type UnauthorizedHandler = () => void | Promise<void>;

/**
 * Creates an API client instance.
 * 
 * For customer/kitchen endpoints (no auth, token is undefined):
 * - Uses empty baseURL to allow relative URLs like '/api/customer/...'
 * - These hit Next.js API routes which proxy to backend
 * 
 * For authenticated endpoints (token provided):
 * - Uses API_BASE_URL for direct backend calls like '/admin/...' or '/users/...'
 */
export const createApiClient = (token?: string, onUnauthorized?: UnauthorizedHandler) => {
  // If no token (customer/kitchen endpoints), use empty baseURL for Next.js API routes
  // If token exists (authenticated), use API_BASE_URL for direct backend calls
  const baseURL = token ? API_BASE_URL : '';
  
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use((config) => {
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401 && onUnauthorized) {
        await onUnauthorized();
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

