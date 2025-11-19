import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '../store/sessionStore';
import { useUIStore } from '../store/uiStore';
import axiosInstance from '../api/axiosInstance';
import { Session } from '../types';

export const useSession = () => {
  const { sessionId, session, setSession, clearSession } = useSessionStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const { data: currentSession, isLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const response = await axiosInstance.get<Session>(`/sessions/${sessionId}`);
      return response.data;
    },
    enabled: !!sessionId,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const startSessionMutation = useMutation({
    mutationFn: async ({ restaurantId, tableId }: { restaurantId: number; tableId: number }) => {
      const response = await axiosInstance.post<Session>('/sessions/start', {
        restaurantId,
        tableId,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSession(data);
      queryClient.invalidateQueries({ queryKey: ['session'] });
      showToast('Session started', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to start session', 'error');
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.post(`/sessions/${sessionId}/end`);
    },
    onSuccess: () => {
      clearSession();
      queryClient.invalidateQueries({ queryKey: ['session'] });
      showToast('Session ended', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to end session', 'error');
    },
  });

  return {
    session: session || currentSession,
    sessionId,
    isLoading,
    startSession: startSessionMutation.mutate,
    endSession: endSessionMutation.mutate,
    isStarting: startSessionMutation.isPending,
    isEnding: endSessionMutation.isPending,
  };
};

