import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const { isAuthenticated, user, hasAnyRole } = useAuthStore();

  // If auth is not required, allow access
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    // Redirect based on user role
    const roleRedirects: Record<UserRole, string> = {
      SUPERADMIN: '/superadmin/dashboard',
      ADMIN: '/admin/dashboard',
      WAITER: '/waiter/dashboard',
      KITCHEN: '/kitchen',
      CUSTOMER: '/menu',
    };
    return <Navigate to={roleRedirects[user.role] || '/menu'} replace />;
  }

  return <>{children}</>;
};

