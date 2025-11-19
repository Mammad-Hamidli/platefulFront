import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { MenuPage } from './features/customer/MenuPage';
import { OrdersPage } from './features/orders/OrdersPage';
import { RestaurantsPage } from './features/restaurants/RestaurantsPage';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { SuperAdminDashboard } from './features/superadmin/SuperAdminDashboard';
import { SuperAdminBranches } from './features/superadmin/SuperAdminBranches';
import { SuperAdminUsers } from './features/superadmin/SuperAdminUsers';
import { WaiterDashboard } from './features/waiter/WaiterDashboard';

import { useAuthStore } from './store/authStore';

const LoginRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (isAuthenticated && user) {
    const roleRedirects: Record<string, string> = {
      SUPERADMIN: '/superadmin/dashboard',
      ADMIN: '/admin/dashboard',
      WAITER: '/waiter/dashboard',
      KITCHEN: '/kitchen',
      CUSTOMER: '/menu',
    };
    return <Navigate to={roleRedirects[user.role] || '/menu'} replace />;
  }
  
  return <LoginPage />;
};

const DefaultRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user) {
    const roleRedirects: Record<string, string> = {
      SUPERADMIN: '/superadmin/dashboard',
      ADMIN: '/admin/dashboard',
      WAITER: '/waiter/dashboard',
      KITCHEN: '/kitchen',
      CUSTOMER: '/menu',
    };
    return <Navigate to={roleRedirects[user.role] || '/menu'} replace />;
  }
  
  return <Navigate to="/menu" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginRoute />} />

      {/* Protected routes */}
      <Route
        path="/menu"
        element={
          <ProtectedRoute>
            <MenuPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN', 'WAITER', 'KITCHEN']}>
            <OrdersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/restaurants"
        element={
          <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN']}>
            <RestaurantsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Super Admin routes */}
      <Route
        path="/superadmin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superadmin/branches"
        element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <SuperAdminBranches />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superadmin/users"
        element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <SuperAdminUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superadmin/*"
        element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Waiter routes */}
      <Route
        path="/waiter/dashboard"
        element={
          <ProtectedRoute allowedRoles={['WAITER']}>
            <WaiterDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/waiter/*"
        element={
          <ProtectedRoute allowedRoles={['WAITER']}>
            <WaiterDashboard />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<DefaultRedirect />} />
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
};

