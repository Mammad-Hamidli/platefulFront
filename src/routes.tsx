import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Auth
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';

// Customer
import { MenuPage } from './features/customer/MenuPage';
import { CartPage } from './features/customer/CartPage';
import { CheckoutPage } from './features/customer/CheckoutPage';
import { OrderStatusPage } from './features/customer/OrderStatusPage';

// Kitchen
import { KitchenOrdersPage } from './features/kitchen/KitchenOrdersPage';
import { KitchenOrderDetail } from './features/kitchen/KitchenOrderDetail';

// Waiter
import { WaiterOrdersPage } from './features/waiter/WaiterOrdersPage';
import { WaiterOrderDetail } from './features/waiter/WaiterOrderDetail';
import { PaymentPage } from './features/waiter/PaymentPage';

// Owner
import { OwnerDashboard } from './features/owner/OwnerDashboard';
import { OwnerMenuPage } from './features/owner/OwnerMenuPage';
import { OwnerTablesPage } from './features/owner/OwnerTablesPage';
import { OwnerBranchesPage } from './features/owner/OwnerBranchesPage';
import { OwnerUsersPage } from './features/owner/OwnerUsersPage';

// SuperAdmin
import { SuperAdminDashboard } from './features/superadmin/SuperAdminDashboard';
import { SuperAdminBranchesPage } from './features/superadmin/SuperAdminBranchesPage';
import { SuperAdminUsersPage } from './features/superadmin/SuperAdminUsersPage';
import { SuperAdminReportsPage } from './features/superadmin/SuperAdminReportsPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={
          <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN']}>
            <RegisterPage />
          </ProtectedRoute>
        }
      />

      {/* Customer Routes */}
      <Route
        path="/menu"
        element={
          <ProtectedRoute>
            <MenuPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-status"
        element={
          <ProtectedRoute>
            <OrderStatusPage />
          </ProtectedRoute>
        }
      />

      {/* Kitchen Routes */}
      <Route
        path="/kitchen"
        element={
          <ProtectedRoute allowedRoles={['KITCHEN', 'ADMIN', 'SUPERADMIN']}>
            <KitchenOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kitchen/orders/:orderId"
        element={
          <ProtectedRoute allowedRoles={['KITCHEN', 'ADMIN', 'SUPERADMIN']}>
            <KitchenOrderDetail />
          </ProtectedRoute>
        }
      />

      {/* Waiter Routes */}
      <Route
        path="/waiter"
        element={
          <ProtectedRoute allowedRoles={['WAITER', 'ADMIN', 'SUPERADMIN']}>
            <WaiterOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/waiter/orders/:orderId"
        element={
          <ProtectedRoute allowedRoles={['WAITER', 'ADMIN', 'SUPERADMIN']}>
            <WaiterOrderDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/waiter/payment/:orderId"
        element={
          <ProtectedRoute allowedRoles={['WAITER', 'ADMIN', 'SUPERADMIN']}>
            <PaymentPage />
          </ProtectedRoute>
        }
      />

      {/* Owner/Admin Routes */}
      <Route
        path="/owner"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/menu"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
            <OwnerMenuPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/tables"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
            <OwnerTablesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/branches"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
            <OwnerBranchesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
            <OwnerUsersPage />
          </ProtectedRoute>
        }
      />

      {/* SuperAdmin Routes */}
      <Route
        path="/superadmin"
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
            <SuperAdminBranchesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/users"
        element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <SuperAdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/reports"
        element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <SuperAdminReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {user?.role === 'SUPERADMIN' ? (
              <Navigate to="/superadmin" replace />
            ) : user?.role === 'ADMIN' ? (
              <Navigate to="/owner" replace />
            ) : user?.role === 'KITCHEN' ? (
              <Navigate to="/kitchen" replace />
            ) : user?.role === 'WAITER' ? (
              <Navigate to="/waiter" replace />
            ) : (
              <Navigate to="/menu" replace />
            )}
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

