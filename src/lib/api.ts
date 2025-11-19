import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from './env';

type UnauthorizedHandler = () => void | Promise<void>;

export const createApiClient = (token?: string, onUnauthorized?: UnauthorizedHandler) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
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

