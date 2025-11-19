import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => void;
  register: (data: {
    username: string;
    email: string;
    password: string;
    role: string;
    restaurantId?: number;
  }) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={{ ...auth, user: auth.user || null }}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

