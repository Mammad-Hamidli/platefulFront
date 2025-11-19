# PlateMenu Frontend

A comprehensive React-based frontend application for restaurant management system with role-based access control.

## Features

- **Multi-role Support**: Customer, Waiter, Kitchen, Admin, and SuperAdmin roles
- **Real-time Updates**: Polling-based order status updates
- **State Management**: Zustand for global state with persistence
- **API Integration**: Axios with React Query for data fetching
- **Responsive Design**: Mobile-first for customer pages, desktop-first for admin
- **Type Safety**: Full TypeScript implementation

## Project Structure

```
src/
├── api/                    # Axios/React Query wrappers
│   ├── auth.ts
│   ├── orders.ts
│   ├── menu.ts
│   ├── tables.ts
│   ├── users.ts
│   ├── branches.ts
│   ├── superadmin.ts
│   └── payments.ts
│
├── components/             # Shared UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Table.tsx
│   ├── Badge.tsx
│   ├── Toast.tsx
│   └── QRScanner.tsx
│
├── features/               # Feature-based modules
│   ├── auth/
│   ├── customer/
│   ├── kitchen/
│   ├── waiter/
│   ├── owner/
│   └── superadmin/
│
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts
│   ├── useOrders.ts
│   ├── useMenu.ts
│   └── useSession.ts
│
├── store/                  # Zustand stores
│   ├── authStore.ts
│   ├── sessionStore.ts
│   ├── orderStore.ts
│   └── uiStore.ts
│
├── types/                  # TypeScript interfaces
│   └── index.ts
│
├── App.tsx
├── routes.tsx
└── index.tsx
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on `http://localhost:8000` (or update proxy in `vite.config.ts`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Configuration

### API Base URL

Update the proxy configuration in `vite.config.ts` if your backend runs on a different port:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

## Role-Based Routes

- **Customer**: `/menu`, `/cart`, `/checkout`, `/order-status`
- **Kitchen**: `/kitchen`, `/kitchen/orders/:orderId`
- **Waiter**: `/waiter`, `/waiter/orders/:orderId`, `/waiter/payment/:orderId`
- **Admin/Owner**: `/owner`, `/owner/menu`, `/owner/tables`, `/owner/branches`, `/owner/users`
- **SuperAdmin**: `/superadmin`, `/superadmin/branches`, `/superadmin/users`, `/superadmin/reports`

## State Management

### Auth Store
- JWT token and user information
- Persisted in localStorage
- Role-based access control helpers

### Session Store
- Active session and table information
- Persisted in sessionStorage

### Order Store
- Shopping cart management
- Current order state

### UI Store
- Toast notifications
- Modal state management

## API Integration

All API calls are made through Axios instances in `src/api/`. React Query handles caching, refetching, and error states.

### Example API Call

```typescript
import { getMenu } from '../api/menu';

const { menu, isLoading } = useMenu(restaurantId, branchId);
```

## Development

### Adding a New Feature

1. Create feature folder in `src/features/`
2. Add API wrappers in `src/api/`
3. Create custom hooks in `src/hooks/` if needed
4. Add routes in `src/routes.tsx` with appropriate role guards

### Styling

The project uses Tailwind CSS. Utility classes are used throughout components.

## Testing Backend Connectivity

Use Postman or similar tools to test backend endpoints before integrating with the frontend. Ensure:

1. Backend is running on the configured port
2. CORS is properly configured
3. Authentication endpoints return JWT tokens
4. All required endpoints are available

## Troubleshooting

### Authentication Issues
- Check localStorage for `auth-storage` key
- Verify JWT token format
- Ensure backend returns proper auth response

### API Connection Issues
- Verify backend is running
- Check proxy configuration in `vite.config.ts`
- Review browser console for CORS errors

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

## License

MIT

