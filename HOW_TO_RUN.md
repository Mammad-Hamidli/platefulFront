# How to Run the Plateful Frontend Project

## Prerequisites

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **Backend API** running on `http://localhost:8080`

## Quick Start

### 1. Install Dependencies (if not already installed)

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The frontend will start on **http://localhost:3000**

### 3. Access the Application

Open your browser and navigate to:
- **http://localhost:3000**

You'll be redirected to the login page if not authenticated.

## Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Configuration

### Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8080/api
```

**Note:** In development, the Vite proxy automatically forwards `/api` requests to `http://localhost:8080`, so the `.env` file is optional.

## Testing the Application

### 1. Login
- Navigate to `http://localhost:3000/login`
- Enter your credentials
- After login, you'll be redirected based on your role:
  - **SUPERADMIN** → `/superadmin/dashboard`
  - **ADMIN** → `/admin/dashboard`
  - **WAITER** → `/waiter/dashboard`
  - **CUSTOMER** → `/menu`

### 2. Test Routes
- `/menu` - Menu page (requires authentication)
- `/orders` - Orders page (SUPERADMIN, ADMIN, WAITER, KITCHEN)
- `/restaurants` - Restaurants page (SUPERADMIN, ADMIN)
- `/admin/dashboard` - Admin dashboard (ADMIN only)
- `/superadmin/dashboard` - SuperAdmin dashboard (SUPERADMIN only)
- `/waiter/dashboard` - Waiter dashboard (WAITER only)

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, Vite will automatically try the next available port. Check the terminal output for the actual port.

### Backend Connection Issues
- Ensure backend is running on `http://localhost:8080`
- Check browser console for CORS errors
- Verify backend endpoints are accessible

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

### TypeScript Errors
```bash
npm run build
```
This will show any TypeScript compilation errors.

## Development Tips

1. **Hot Module Replacement (HMR)**: Changes to files will automatically reload in the browser
2. **Browser DevTools**: Use React DevTools and Network tab to debug
3. **Console Logs**: Check browser console for errors and API responses
4. **LocalStorage**: Check browser DevTools → Application → Local Storage for auth tokens

## Production Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

To preview the production build:

```bash
npm run preview
```

