import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login, register, getCurrentUser, logout } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

export const useAuth = () => {
  const { setAuth, clearAuth, user, isAuthenticated } = useAuthStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      showToast('Login successful', 'success');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Login failed', 'error');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: {
      username: string;
      email: string;
      password: string;
      role: string;
      restaurantId?: number;
    }) => register(data.username, data.email, data.password, data.role, data.restaurantId),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      showToast('Registration successful', 'success');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Registration failed', 'error');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      showToast('Logged out successfully', 'success');
    },
    onError: () => {
      clearAuth();
      queryClient.clear();
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ['user', 'current'],
    queryFn: getCurrentUser,
    enabled: isAuthenticated && !!useAuthStore.getState().token,
  });

  return {
    user: user || currentUser,
    isAuthenticated,
    login: (credentials: { username: string; password: string }, options?: any) => {
      loginMutation.mutate(credentials, options);
    },
    register: (data: {
      username: string;
      email: string;
      password: string;
      role: string;
      restaurantId?: number;
    }, options?: any) => {
      registerMutation.mutate(data, options);
    },
    logout: (options?: any) => {
      logoutMutation.mutate(undefined, options);
    },
    isLoading: loginMutation.isPending || registerMutation.isPending,
  };
};

