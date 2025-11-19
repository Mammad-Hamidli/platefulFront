# Login Debugging Guide

## Steps to Debug Login Issues

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab. You should now see detailed error messages including:
- The exact error response from the backend
- HTTP status codes
- Network request details

### 2. Check Network Tab
1. Open Developer Tools (F12)
2. Go to the **Network** tab
3. Try logging in again
4. Look for the login request (usually `/api/auth/login` or `/api/login`)
5. Check:
   - **Status Code**: What HTTP status is returned?
   - **Request Payload**: What data is being sent?
   - **Response**: What is the backend returning?

### 3. Common Issues and Solutions

#### Issue: 404 Not Found
**Meaning**: The endpoint doesn't exist
**Solution**: 
- Check if backend is running on `http://localhost:8080`
- Verify the endpoint path in your backend code
- The frontend tries `/api/auth/login` first, then `/api/login` as fallback

#### Issue: 401 Unauthorized
**Meaning**: Invalid credentials
**Solution**:
- Verify username and password are correct
- Check if the user exists in the backend database
- Ensure password is correct (case-sensitive)

#### Issue: CORS Error
**Meaning**: Backend is blocking the request
**Solution**:
- Ensure backend CORS is configured to allow `http://localhost:3000`
- Check backend CORS configuration

#### Issue: Network Error / Cannot Connect
**Meaning**: Backend is not running or not accessible
**Solution**:
- Ensure backend is running on `http://localhost:8080`
- Check if backend is accessible: Open `http://localhost:8080/api/auth/login` in browser (should show error, not connection refused)
- Verify Vite proxy is working (check `vite.config.ts`)

### 4. Backend Endpoint Requirements

The frontend expects one of these endpoints:
- `POST /api/auth/login` (preferred)
- `POST /api/login` (fallback)

**Request Body**:
```json
{
  "username": "superadmin",
  "password": "superadmin123"
}
```

**Expected Response Format** (any of these):
```json
// Format 1
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "superadmin",
    "email": "admin@example.com",
    "role": "ROLE_SUPERADMIN"
  }
}

// Format 2
{
  "accessToken": "jwt-token-here",
  "user": { ... }
}

// Format 3
{
  "jwt": "jwt-token-here",
  "user": { ... }
}

// Format 4 (user fields at root)
{
  "token": "jwt-token-here",
  "id": 1,
  "username": "superadmin",
  "email": "admin@example.com",
  "role": "ROLE_SUPERADMIN"
}
```

### 5. Test Backend Directly

You can test the backend endpoint directly using curl or Postman:

```bash
# Using curl
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"superadmin123"}'
```

Or use Postman:
- Method: POST
- URL: `http://localhost:8080/api/auth/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "username": "superadmin",
  "password": "superadmin123"
}
```

### 6. Verify Backend Response

Check if your backend returns:
- ✅ Status 200 on success
- ✅ JWT token in response
- ✅ User object with `role` field
- ✅ Role value matches: `ROLE_SUPERADMIN`, `ROLE_ADMIN`, or `ROLE_WAITER`

### 7. Check Vite Proxy

The Vite proxy should forward `/api/*` to `http://localhost:8080`. Verify in `vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    secure: false,
  },
}
```

## Quick Checklist

- [ ] Backend is running on `http://localhost:8080`
- [ ] Backend endpoint exists: `/api/auth/login` or `/api/login`
- [ ] Backend accepts POST requests with JSON body
- [ ] Backend returns token and user object
- [ ] User role is included in response
- [ ] CORS is configured to allow `http://localhost:3000`
- [ ] Check browser console for detailed error messages
- [ ] Check Network tab for request/response details

## Still Having Issues?

1. **Check the browser console** - The improved error handling now shows detailed messages
2. **Check the Network tab** - See the actual request and response
3. **Test backend directly** - Use Postman or curl to verify backend works
4. **Verify credentials** - Make sure the user exists in your backend database

The frontend code now handles multiple response formats and endpoint variations, so the issue is likely:
- Backend not running
- Wrong endpoint path
- Invalid credentials
- CORS configuration
- Backend response format not matching any expected format

