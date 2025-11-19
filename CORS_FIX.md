# CORS Fix Explanation

## Problem
The frontend was making direct requests to `http://localhost:8080/api/menu` from `http://localhost:3002`, which caused CORS errors because:
- Frontend origin: `http://localhost:3002`
- Backend origin: `http://localhost:8080`
- Different origins = CORS blocked

## Solution
Use Vite's built-in proxy in development to avoid CORS issues:

1. **In Development**: Use relative `/api` path
   - Vite proxy (configured in `vite.config.ts`) forwards `/api/*` to `http://localhost:8080`
   - Since the request appears to come from the same origin (frontend server), no CORS issues
   - Request: `http://localhost:3002/api/menu` → Vite proxy → `http://localhost:8080/api/menu`

2. **In Production**: Use full URL from environment variable
   - Production builds need the full backend URL
   - Set `VITE_API_URL=http://your-backend-url/api` in production

## Configuration

### Development (Current Setup)
```typescript
// src/config/api.ts
export const BASE_URL = 
  import.meta.env.VITE_API_URL || 
  import.meta.env.NEXT_PUBLIC_API_URL || 
  (import.meta.env.DEV ? '/api' : 'http://localhost:8080/api');
```

### Vite Proxy (Already Configured)
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

## How It Works

1. Frontend makes request to: `/api/menu`
2. Vite intercepts `/api/*` requests
3. Vite forwards to: `http://localhost:8080/api/menu`
4. Backend responds to Vite
5. Vite returns response to frontend
6. **No CORS issues** because browser sees same-origin request

## Testing

After this fix:
- ✅ No CORS errors
- ✅ Requests go through Vite proxy
- ✅ Backend receives requests correctly
- ✅ Menu page loads successfully

## Note on Port 3002

If Vite is running on port 3002 instead of 3000, it's because port 3000 was already in use. The proxy still works the same way on any port.

