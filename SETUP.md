# Quick Setup Guide

## Installation

1. Install dependencies:
```bash
npm install
```

2. (Optional) Create `.env` file:
```bash
VITE_API_URL=http://localhost:8080/api
```

Note: In development, the Vite proxy automatically forwards `/api` to `http://localhost:8080`, so the `.env` file is optional.

## Running the Application

1. **Start the backend** on `http://localhost:8080`

2. **Start the frontend**:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Testing the Fixes

### 1. Test Login and Role-Based Redirect
- Go to `http://localhost:3000/login`
- Login with different user roles
- Verify redirects:
  - SUPERADMIN → `/superadmin/dashboard`
  - ADMIN → `/admin/dashboard`
  - WAITER → `/waiter/dashboard`
  - CUSTOMER → `/menu`

### 2. Test Protected Routes
- Try accessing `/orders` (should work for SUPERADMIN, ADMIN, WAITER, KITCHEN)
- Try accessing `/restaurants` (should work for SUPERADMIN, ADMIN only)
- Try accessing `/admin/dashboard` (should work for ADMIN only)
- Try accessing `/superadmin/dashboard` (should work for SUPERADMIN only)

### 3. Test Menu Page
- Navigate to `/menu`
- Verify menu items load and display correctly
- Test category filtering if available

### 4. Test Navigation
- All dashboard pages should have working navigation
- Logout should work from all pages
- Back buttons should navigate correctly

## Troubleshooting

### Backend Connection Issues
- Ensure backend is running on `http://localhost:8080`
- Check browser console for CORS errors
- Verify backend endpoints match expected format

### Authentication Issues
- Check browser localStorage for `auth-token` and `auth-storage`
- Verify JWT token format matches backend
- Check that `/api/auth/login` returns `{ token: string, user: User }`

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

## Key Features Implemented

✅ BASE_URL configuration with environment variable support
✅ Role-based redirect after login
✅ Protected routes with role-based access control
✅ All pages (menu, orders, restaurants, admin, superadmin) working
✅ Proper routing without forced redirects
✅ Menu page rendering correctly
✅ API client with JWT token handling
✅ Zustand store for authentication state

All frontend issues have been fixed!

