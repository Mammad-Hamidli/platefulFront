import api from './apiClient';
import type { AuthResponse, LoginRequest, User } from '../types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    // Try /auth/login first, fallback to /login if needed
    // Backend might use different endpoint structure
    try {
      const response = await api.post<any>('/auth/login', credentials);
      const data = response.data;
      
      // Handle different response formats from backend
      // Format 1: { token: string, user: User }
      // Format 2: { accessToken: string, user: User }
      // Format 3: { jwt: string, user: User }
      // Format 4: { token: string, ...userFields } (user fields at root)
      
      let token = data.token || data.accessToken || data.jwt || data.access_token;
      let user = data.user;
      
      // If user fields are at root level, construct user object
      if (!user && (data.id || data.username || data.email)) {
        user = {
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,
        };
      }
      
      if (!token || !user) {
        throw new Error('Invalid response format from backend. Expected { token, user } or { accessToken, user }');
      }
      
      return { token, user };
    } catch (error: any) {
      // If /auth/login fails with 404, try /login
      if (error.response?.status === 404) {
        const response = await api.post<any>('/login', credentials);
        const data = response.data;

        let token = data.token || data.accessToken || data.jwt || data.access_token;
        let user = data.user;

        if (!user && (data.id || data.username || data.email)) {
          user = {
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role,
            firstName: data.firstName,
            lastName: data.lastName,
          };
        }

        if (!token || !user) {
          throw new Error(
            'Invalid response format from backend. Expected { token, user } or { accessToken, user }'
          );
        }

        return { token, user };
      }
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

