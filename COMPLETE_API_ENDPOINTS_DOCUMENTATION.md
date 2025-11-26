# 📋 Complete Backend API Endpoints Documentation

This document provides a comprehensive list of ALL API endpoints in the backend, including exact JSON request body formats, path variables, query parameters, and validation rules.

---

## 🔐 Authentication Endpoints (`/api/auth`)

### 1. Login
**ENDPOINT:**
```
POST /api/auth/login
```

**REQUEST BODY JSON:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**DTO:** `LoginRequest`
- `email` (String, **REQUIRED**, `@NotBlank`, `@Email`) - User email
- `password` (String, **REQUIRED**, `@NotBlank`) - User password

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**RESPONSE:** `LoginResponse` with JWT token, user info, restaurantId, branchId

---

### 2. Register
**ENDPOINT:**
```
POST /api/auth/register
```

**REQUEST BODY JSON:**
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "password123",
  "role": "ADMIN",
  "restaurantId": 1
}
```

**DTO:** `RegisterRequest`
- `username` (String, **REQUIRED**, `@NotBlank`) - Username (legacy field)
- `email` (String, **REQUIRED**, `@NotBlank`) - User email
- `password` (String, **REQUIRED**, `@NotBlank`) - User password
- `role` (String, **REQUIRED**, `@NotBlank`) - "SUPERADMIN" or "ADMIN" (with or without ROLE_ prefix)
- `restaurantId` (Long, **REQUIRED**, `@NotNull`) - Restaurant ID

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**NOTE:** Only ROLE_SUPERADMIN and ROLE_ADMIN can register publicly

---

### 3. Logout
**ENDPOINT:**
```
POST /api/auth/logout
```

**REQUEST BODY JSON:** None

**HEADERS:**
- `Authorization: Bearer {jwt_token}` (optional)

**PATH VARIABLES:** None

**QUERY PARAMS:** None

---

## 👤 User Management Endpoints (`/api/users`)

### 4. Create User
**ENDPOINT:**
```
POST /api/users
```

**REQUEST BODY JSON:**
```json
{
  "email": "waiter@example.com",
  "password": "password123",
  "role": "ROLE_WAITER",
  "restaurantId": 1,
  "branchId": 5,
  "phoneNumber": "+1234567890",
  "salaryAmount": 1000.00,
  "salaryPeriod": "MONTHLY"
}
```

**DTO:** `CreateUserRequest`
- `email` (String, **REQUIRED**, `@NotBlank`, `@Email`) - User email
- `password` (String, **OPTIONAL**) - Required for ROLE_SUPERADMIN and ROLE_ADMIN only
- `role` (String, **REQUIRED**, `@NotBlank`) - ROLE_SUPERADMIN, ROLE_ADMIN, ROLE_WAITER, ROLE_KITCHEN, ROLE_CASHIER, etc.
- `restaurantId` (Long, **REQUIRED**, `@NotNull`) - Restaurant ID
- `branchId` (Long, **OPTIONAL**) - Required for ADMIN, WAITER, KITCHEN (null for SUPERADMIN)
- `phoneNumber` (String, **OPTIONAL**) - Required for staff members
- `salaryAmount` (BigDecimal, **OPTIONAL**, `@Positive`) - Required for staff members
- `salaryPeriod` (SalaryPeriod, **OPTIONAL**) - DAILY, WEEKLY, or MONTHLY - Required for staff members

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")`

---

### 5. Get User by Email
**ENDPOINT:**
```
GET /api/users/{email}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `email` (String) - User email (URL encoded if contains special characters)

**QUERY PARAMS:** None

**NOTE:** Email is URL decoded automatically

---

### 6. List Users
**ENDPOINT:**
```
GET /api/users
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:** None

**QUERY PARAMS:** None

---

### 7. Update User
**ENDPOINT:**
```
PATCH /api/users/{email}
```

**REQUEST BODY JSON:**
```json
{
  "password": "newpassword123",
  "role": "ROLE_ADMIN",
  "restaurantId": 1,
  "branchId": 5,
  "phoneNumber": "+1234567890",
  "salaryAmount": 1200.00,
  "salaryPeriod": "MONTHLY"
}
```

**DTO:** `UpdateUserRequest`
- `password` (String, **OPTIONAL**) - Can only be set for ROLE_SUPERADMIN and ROLE_ADMIN
- `role` (String, **OPTIONAL**) - Role update (restricted by requester role)
- `restaurantId` (Long, **OPTIONAL**) - Restaurant ID (restricted by role)
- `branchId` (Long, **OPTIONAL**) - Branch ID (restricted by role)
- `phoneNumber` (String, **OPTIONAL**) - Can be updated for staff members
- `salaryAmount` (BigDecimal, **OPTIONAL**, `@Positive`) - Can be updated for staff members
- `salaryPeriod` (SalaryPeriod, **OPTIONAL**) - Can be updated for staff members

**PATH VARIABLES:**
- `email` (String) - User email (URL encoded)

**QUERY PARAMS:** None

---

### 8. Delete User
**ENDPOINT:**
```
DELETE /api/users/{email}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `email` (String) - User email (URL encoded)

**QUERY PARAMS:** None

---

### 9. Get Current User
**ENDPOINT:**
```
GET /api/users/me
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:** None

**QUERY PARAMS:** None

---

### 10. Update Current User
**ENDPOINT:**
```
PUT /api/users/me
```

**REQUEST BODY JSON:** Same as Update User (UpdateUserRequest)

**PATH VARIABLES:** None

**QUERY PARAMS:** None

---

### 11. List Waiters by Branch
**ENDPOINT:**
```
GET /api/users/branches/{branchId}/waiters
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `branchId` (Long) - Branch ID

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN') and @security.branchPermission(#branchId)")`

---

## 🏢 Superadmin Dashboard Endpoints (`/api/superadmin`)

### 12. Get Current Restaurant
**ENDPOINT:**
```
GET /api/superadmin/restaurant
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")`

---

### 13. List Admins
**ENDPOINT:**
```
GET /api/superadmin/admins
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")`

---

### 14. Reset Admin Password ⭐
**ENDPOINT:**
```
POST /api/superadmin/admins/{adminId}/reset-password
```

**REQUEST BODY JSON:**
```json
{
  "newPassword": "Admin123!"
}
```

**DTO:** `ResetPasswordRequest`
- `newPassword` (String, **REQUIRED**, `@NotBlank`, `@Size(min = 6)`) - New password (minimum 6 characters)

**PATH VARIABLES:**
- `adminId` (Long) - Admin user ID

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")`

**RESPONSE:**
```json
{
  "status": "success",
  "message": "Admin password reset successfully",
  "newPassword": "Admin123!",
  "adminEmail": "admin@example.com",
  "adminUserId": 1234567890
}
```

---

### 15. List Branches
**ENDPOINT:**
```
GET /api/superadmin/branches
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")`

---

### 16. Get Branch
**ENDPOINT:**
```
GET /api/superadmin/branches/{branchId}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `branchId` (Long) - Branch ID

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")`

---

### 17. Create Branch
**ENDPOINT:**
```
POST /api/superadmin/branches
```

**REQUEST BODY JSON:**
```json
{
  "name": "Yasamal Branch",
  "restaurantId": 1,
  "managerUserId": 1234567890
}
```

**DTO:** `SuperAdminBranchRequest`
- `name` (String, **REQUIRED**, `@NotBlank`) - Branch name
- `restaurantId` (Long, **REQUIRED**, `@NotNull`, `@Min(1)`) - Restaurant ID (must be positive)
- `managerUserId` (Long, **OPTIONAL**) - Manager/admin user ID

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")`

---

### 18. Update Branch
**ENDPOINT:**
```
PUT /api/superadmin/branches/{branchId}
```

**REQUEST BODY JSON:**
```json
{
  "name": "Updated Branch Name",
  "restaurantId": 1,
  "managerUserId": 1234567890
}
```

**DTO:** `SuperAdminBranchRequest` (same as Create Branch)

**PATH VARIABLES:**
- `branchId` (Long) - Branch ID

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN','ROLE_ADMIN')")`

---

### 19. Delete Branch
**ENDPOINT:**
```
DELETE /api/superadmin/branches/{branchId}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `branchId` (Long) - Branch ID

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")`

---

### 20. List Menu Items
**ENDPOINT:**
```
GET /api/superadmin/menu
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")`

---

### 21. List Tables
**ENDPOINT:**
```
GET /api/superadmin/tables
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")`

---

### 22. List Users by Branch
**ENDPOINT:**
```
GET /api/superadmin/branches/{branchId}/users
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `branchId` (Long) - Branch ID

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")`

---

### 23. Create User ⭐
**ENDPOINT:**
```
POST /api/superadmin/users
```

**REQUEST BODY JSON:**
```json
{
  "email": "admin@example.com",
  "password": "Admin123!",
  "role": "BRANCH_MANAGER",
  "restaurantId": 1,
  "branchId": 5
}
```

**DTO:** `SuperAdminUserRequest`
- `email` (String, **REQUIRED**, `@NotBlank`, `@Email`) - User email
- `password` (String, **REQUIRED**, `@NotBlank`) - User password
- `role` (String, **REQUIRED**, `@NotBlank`) - Expected values: "BRANCH_MANAGER" or "POS_STAFF" (resolved server-side to ROLE_ADMIN or ROLE_WAITER)
- `restaurantId` (Long, **REQUIRED**, `@NotNull`, `@Min(1)`) - Restaurant ID (must be positive)
- `branchId` (Long, **OPTIONAL**) - Branch association (optional at creation time)

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")`

---

### 24. Update User
**ENDPOINT:**
```
PUT /api/superadmin/users/{email}
```

**REQUEST BODY JSON:**
```json
{
  "password": "NewPassword123!",
  "role": "BRANCH_MANAGER",
  "email": "newemail@example.com",
  "branchId": 6
}
```

**DTO:** `SuperAdminUserUpdateRequest`
- `password` (String, **OPTIONAL**) - Password update
- `role` (String, **OPTIONAL**) - Role update (when null, role stays unchanged)
- `email` (String, **OPTIONAL**) - Email update (when null, email stays unchanged)
- `branchId` (Long, **OPTIONAL**) - Branch reassignment

**PATH VARIABLES:**
- `email` (String) - User email (URL encoded, pattern: `{email:.+}`)

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN','ROLE_ADMIN')")`

---

### 25. Delete User
**ENDPOINT:**
```
DELETE /api/superadmin/users/{email}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `email` (String) - User email (URL encoded, pattern: `{email:.+}`)

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN','ROLE_ADMIN')")`

---

### 26. Get Financial Analytics
**ENDPOINT:**
```
POST /api/superadmin/analytics/query
```

**REQUEST BODY JSON:**
```json
{
  "restaurantId": 1,
  "branchId": 5,
  "fromDate": "2025-01-01",
  "toDate": "2025-12-31",
  "granularity": "MONTHLY"
}
```

**DTO:** `FinancialAnalyticsRequest`
- `restaurantId` (Long, **OPTIONAL**) - Restaurant ID
- `branchId` (Long, **OPTIONAL**) - Branch ID
- `fromDate` (LocalDate, **OPTIONAL**) - Custom range start (inclusive), format: "YYYY-MM-DD"
- `toDate` (LocalDate, **OPTIONAL**) - Custom range end (inclusive), format: "YYYY-MM-DD"
- `granularity` (AnalyticsGranularity, **REQUIRED**, `@NotNull`) - "DAILY", "WEEKLY", or "MONTHLY"

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")`

---

### 27. Get Active Sessions
**ENDPOINT:**
```
GET /api/superadmin/sessions
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:** None

**QUERY PARAMS:**
- `branchId` (Long, **OPTIONAL**) - Filter by branch ID

**AUTHORIZATION:** `@PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")`

---

### 28. Override Session
**ENDPOINT:**
```
POST /api/superadmin/sessions/override
```

**REQUEST BODY JSON:**
```json
{
  "sessionId": "session-uuid-123",
  "branchId": 5,
  "reason": "Force close due to system issue"
}
```

**DTO:** `PosSessionOverrideRequest`
- `sessionId` (String, **REQUIRED**, `@NotBlank`) - Session ID
- `branchId` (Long, **OPTIONAL**) - Branch ID
- `reason` (String, **OPTIONAL**) - Reason for override

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")`

---

## 🏪 Restaurant Endpoints (`/api/restaurants`)

### 29. Create Restaurant
**ENDPOINT:**
```
POST /api/restaurants
```

**REQUEST BODY JSON:**
```json
{
  "id": 1,
  "name": "My Restaurant",
  "ownerSuperAdminId": 1234567890,
  "timezone": "UTC",
  "currency": "USD",
  "settingsJson": "{\"theme\":\"dark\"}"
}
```

**DTO:** `CreateRestaurantRequest`
- `id` (Long, **OPTIONAL**) - Restaurant ID (will be generated if not provided)
- `name` (String, **REQUIRED**, `@NotBlank`) - Restaurant name
- `ownerSuperAdminId` (Long, **REQUIRED**, `@NotNull`) - The SUPERADMIN user who owns this restaurant
- `timezone` (String, **OPTIONAL**) - Timezone
- `currency` (String, **OPTIONAL**) - Currency code
- `settingsJson` (String, **OPTIONAL**) - JSON settings string

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasRole('SUPERADMIN')")`

---

### 30. Get Restaurant
**ENDPOINT:**
```
GET /api/restaurants/{id}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `id` (Long) - Restaurant ID

**QUERY PARAMS:** None

---

### 31. List Restaurants
**ENDPOINT:**
```
GET /api/restaurants
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:** None

**QUERY PARAMS:** None

---

### 32. Update Restaurant
**ENDPOINT:**
```
PUT /api/restaurants/{id}
```

**REQUEST BODY JSON:**
```json
{
  "name": "Updated Restaurant Name",
  "timezone": "EST",
  "currency": "EUR",
  "settingsJson": "{\"theme\":\"light\"}"
}
```

**DTO:** `UpdateRestaurantRequest`
- `name` (String, **OPTIONAL**) - Restaurant name
- `timezone` (String, **OPTIONAL**) - Timezone
- `currency` (String, **OPTIONAL**) - Currency code
- `settingsJson` (String, **OPTIONAL**) - JSON settings string

**PATH VARIABLES:**
- `id` (Long) - Restaurant ID

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasRole('SUPERADMIN')")`

---

### 33. Delete Restaurant
**ENDPOINT:**
```
DELETE /api/restaurants/{id}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `id` (Long) - Restaurant ID

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasRole('SUPERADMIN')")`

---

## 🌿 Branch Endpoints (`/api`)

### 34. Create Branch
**ENDPOINT:**
```
POST /api/restaurants/{restaurantId}/branches
```

**REQUEST BODY JSON:**
```json
{
  "name": "Yasamal Branch",
  "restaurantId": 1,
  "adminUserId": 1234567890
}
```

**DTO:** `CreateBranchRequest`
- `name` (String, **REQUIRED**, `@NotBlank`) - Branch name
- `restaurantId` (Long, **REQUIRED**, `@NotNull`) - Restaurant ID (also in path)
- `adminUserId` (Long, **OPTIONAL**) - Admin user ID (can be assigned later)

**PATH VARIABLES:**
- `restaurantId` (Long) - Restaurant ID

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasRole('SUPERADMIN')")`

**NOTE:** `restaurantId` in body is set to match path variable

---

### 35. Get Branch
**ENDPOINT:**
```
GET /api/branches/{branchId}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `branchId` (Long) - Branch ID

**QUERY PARAMS:** None

---

### 36. List Branches by Restaurant
**ENDPOINT:**
```
GET /api/restaurants/{restaurantId}/branches
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `restaurantId` (Long) - Restaurant ID

**QUERY PARAMS:** None

---

### 37. Update Branch
**ENDPOINT:**
```
PUT /api/branches/{branchId}
```

**REQUEST BODY JSON:**
```json
{
  "name": "Updated Branch Name",
  "adminUserId": 1234567890
}
```

**DTO:** `UpdateBranchRequest`
- `name` (String, **OPTIONAL**) - Branch name
- `adminUserId` (Long, **OPTIONAL**) - Admin user ID

**PATH VARIABLES:**
- `branchId` (Long) - Branch ID

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasRole('SUPERADMIN')")`

---

### 38. Delete Branch
**ENDPOINT:**
```
DELETE /api/branches/{branchId}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `branchId` (Long) - Branch ID

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasRole('SUPERADMIN')")`

---

### 39. Assign Admin to Branch ⭐
**ENDPOINT:**
```
POST /api/branches/{branchId}/assign-admin
```

**REQUEST BODY JSON:**
```json
{
  "adminUserId": 1234567890
}
```

**DTO:** `Map<String, Long>` (not a DTO class, just a map)
- `adminUserId` (Long, **REQUIRED**) - Admin user ID

**PATH VARIABLES:**
- `branchId` (Long) - Branch ID

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasRole('SUPERADMIN')")`

**RESPONSE (Success):**
```json
{
  "status": "success",
  "message": "Admin assigned to branch successfully",
  "branchId": 5,
  "adminId": 1234567890
}
```

**RESPONSE (Error - Branch has admin):**
```json
{
  "error": "branch_has_admin",
  "message": "This branch already has an assigned admin. Please remove the existing admin before assigning a new one."
}
```

---

## 🍽️ Menu Endpoints (`/api/menu`)

### 40. Get Menu (Public)
**ENDPOINT:**
```
GET /api/menu?restId={restaurantId}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:** None

**QUERY PARAMS:**
- `restId` (Long, **REQUIRED**) - Restaurant ID

---

### 41. Get Menu Item
**ENDPOINT:**
```
GET /api/menu/{menuItemId}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `menuItemId` (Long) - Menu item ID

**QUERY PARAMS:** None

---

### 42. Get All Menu Items (Admin)
**ENDPOINT:**
```
GET /api/menu/admin/all?restId={restaurantId}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:** None

**QUERY PARAMS:**
- `restId` (Long, **REQUIRED**) - Restaurant ID

**AUTHORIZATION:** `@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")`

---

### 43. Create Menu Item
**ENDPOINT:**
```
POST /api/menu
```

**REQUEST BODY JSON:**
```json
{
  "restaurantId": 1,
  "name": "Pizza Margherita",
  "description": "Classic pizza with tomato and mozzarella",
  "priceCents": 1500,
  "category": "Pizza",
  "isAvailable": true
}
```

**DTO:** `CreateMenuItemRequest`
- `restaurantId` (Long, **REQUIRED**, `@NotNull`) - Restaurant ID
- `name` (String, **REQUIRED**, `@NotBlank`) - Menu item name
- `description` (String, **OPTIONAL**) - Menu item description
- `priceCents` (Long, **REQUIRED**, `@NotNull`, `@Positive`) - Price in cents (must be positive)
- `category` (String, **OPTIONAL**) - Menu item category
- `isAvailable` (Boolean, **OPTIONAL**) - Availability status (default: true)

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")`

---

### 44. Update Menu Item
**ENDPOINT:**
```
PUT /api/menu/{menuItemId}
```

**REQUEST BODY JSON:**
```json
{
  "name": "Updated Pizza Name",
  "description": "Updated description",
  "priceCents": 1800,
  "category": "Pizza",
  "isAvailable": false
}
```

**DTO:** `UpdateMenuItemRequest`
- `name` (String, **OPTIONAL**) - Menu item name
- `description` (String, **OPTIONAL**) - Menu item description
- `priceCents` (Long, **OPTIONAL**, `@Positive`) - Price in cents (must be positive if provided)
- `category` (String, **OPTIONAL**) - Menu item category
- `isAvailable` (Boolean, **OPTIONAL**) - Availability status

**PATH VARIABLES:**
- `menuItemId` (Long) - Menu item ID

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")`

---

### 45. Delete Menu Item
**ENDPOINT:**
```
DELETE /api/menu/{menuItemId}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `menuItemId` (Long) - Menu item ID

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")`

---

## 🪑 Table Endpoints (`/api/tables`)

### 46. Get Tables
**ENDPOINT:**
```
GET /api/tables?restId={restaurantId}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:** None

**QUERY PARAMS:**
- `restId` (Long, **REQUIRED**) - Restaurant ID

---

### 47. Get Table
**ENDPOINT:**
```
GET /api/tables/{tableId}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `tableId` (Long) - Table ID

**QUERY PARAMS:** None

---

### 48. Create Table
**ENDPOINT:**
```
POST /api/tables
```

**REQUEST BODY JSON:**
```json
{
  "restaurantId": 1,
  "branchId": 5,
  "name": "Table 1",
  "seatCount": 4,
  "tableNumber": 1
}
```

**DTO:** `CreateTableRequest`
- `restaurantId` (Long, **REQUIRED**, `@NotNull`) - Restaurant ID
- `branchId` (Long, **REQUIRED**, `@NotNull`) - Branch ID
- `name` (String, **REQUIRED**, `@NotBlank`) - Table name
- `seatCount` (Integer, **REQUIRED**, `@Positive`) - Number of seats (must be positive)
- `tableNumber` (Integer, **OPTIONAL**) - Table number (will be auto-generated if not provided)

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")`

---

### 49. Update Table
**ENDPOINT:**
```
PUT /api/tables/{tableId}
```

**REQUEST BODY JSON:** Same as Create Table (`CreateTableRequest`)

**PATH VARIABLES:**
- `tableId` (Long) - Table ID

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")`

---

### 50. Delete Table
**ENDPOINT:**
```
DELETE /api/tables/{tableId}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `tableId` (Long) - Table ID

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")`

---

## 🛒 Order Endpoints (`/api/orders`)

### 51. Create Order
**ENDPOINT:**
```
POST /api/orders
```

**REQUEST BODY JSON:**
```json
{
  "restaurantId": 1,
  "tableId": 10,
  "branchId": 5,
  "guestSessionId": "session-uuid-123",
  "customerId": "customer-123",
  "items": [
    {
      "menuItemId": 100,
      "qty": 2
    }
  ]
}
```

**DTO:** `OrderRequestDTO`
- `restaurantId` (Long, **REQUIRED**, `@NotNull`) - Restaurant ID
- `tableId` (Long, **REQUIRED**, `@NotNull`) - Table ID
- `branchId` (Long, **REQUIRED**, `@NotNull`) - Branch ID
- `guestSessionId` (String, **OPTIONAL**) - UUID for anonymous customers
- `customerId` (String, **OPTIONAL**) - Customer identifier (user ID or guest identifier)
- `items` (List<OrderItemDTO>, **REQUIRED**, `@NotEmpty`, `@Valid`) - Order items (must contain at least one item)

**OrderItemDTO:**
- `menuItemId` (Long, **REQUIRED**, `@NotNull`) - Menu item ID
- `qty` (Integer, **REQUIRED**, `@NotNull`, `@Min(1)`) - Quantity (must be at least 1)
- `priceCents` (Long, **OPTIONAL**) - Price in cents (used in response)
- `menuItemName` (String, **OPTIONAL**) - Menu item name (used in response)
- `notes` (String, **OPTIONAL**) - Item-specific notes (if supported)

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**NOTE:** Rate limited per guest session

---

### 52. Get Order
**ENDPOINT:**
```
GET /api/orders/{orderId}?guestSessionId={sessionId}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `orderId` (Long) - Order ID

**QUERY PARAMS:**
- `guestSessionId` (String, **OPTIONAL**) - Guest session ID for validation

---

### 53. Update Order
**ENDPOINT:**
```
PUT /api/orders/{orderId}
```

**REQUEST BODY JSON:** Same as Create Order (`OrderRequestDTO`)

**PATH VARIABLES:**
- `orderId` (Long) - Order ID

**QUERY PARAMS:** None

---

### 54. Update Order Status
**ENDPOINT:**
```
PATCH /api/orders/{orderId}/status
```

**REQUEST BODY JSON:**
```json
{
  "status": "PREPARING",
  "notes": "Started cooking"
}
```

**DTO:** `UpdateOrderStatusRequest`
- `status` (String, **REQUIRED**, `@NotBlank`, `@Pattern`) - Must be one of: "ORDERED", "PREPARING", "PREPARED_WAITING", "SERVED", "COMPLETED", "CANCELLED"
- `notes` (String, **OPTIONAL**) - Optional notes about the status change

**PATH VARIABLES:**
- `orderId` (Long) - Order ID

**QUERY PARAMS:** None

---

### 55. Get Orders by Session
**ENDPOINT:**
```
GET /api/orders/session/{sessionId}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `sessionId` (String) - Session ID

**QUERY PARAMS:** None

---

### 56. Get Orders by Session (Query Param)
**ENDPOINT:**
```
GET /api/orders/list?sessionId={sessionId}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:** None

**QUERY PARAMS:**
- `sessionId` (String, **OPTIONAL**) - Session ID (required for successful response)

---

### 57. Get Order Logs
**ENDPOINT:**
```
GET /api/orders/{orderId}/logs
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:**
- `orderId` (Long) - Order ID

**QUERY PARAMS:** None

---

### 58. Cancel Order
**ENDPOINT:**
```
POST /api/orders/{orderId}/cancel
```

**REQUEST BODY JSON:**
```json
{
  "customerId": "customer-123",
  "guestSessionId": "session-uuid-123"
}
```

**DTO:** `CancelOrderRequest`
- `customerId` (String, **OPTIONAL**) - Customer ID
- `guestSessionId` (String, **OPTIONAL**) - Guest session ID

**PATH VARIABLES:**
- `orderId` (Long) - Order ID

**QUERY PARAMS:** None

---

## 💳 Payment Endpoints (`/api/payments`)

### 59. Process Payment
**ENDPOINT:**
```
POST /api/payments
```

**REQUEST BODY JSON:**
```json
{
  "orderId": 100,
  "paymentMethod": "CASH",
  "amountPaidCents": 3000,
  "transactionId": "txn-123456",
  "notes": "Paid in full"
}
```

**DTO:** `PaymentRequest`
- `orderId` (Long, **REQUIRED**, `@NotNull`) - Order ID
- `paymentMethod` (String, **REQUIRED**, `@NotBlank`) - Payment method: "CASH", "CARD", "MOBILE_PAYMENT", etc.
- `amountPaidCents` (Long, **OPTIONAL**) - Amount paid in cents (if not provided, uses order total)
- `transactionId` (String, **OPTIONAL**) - External payment gateway transaction ID
- `notes` (String, **OPTIONAL**) - Optional payment notes

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**AUTHORIZATION:** `@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'WAITER')")`

---

## 👥 Customer Endpoints (`/api/customer`)

### 60. Start Session
**ENDPOINT:**
```
POST /api/customer/session/start
```

**REQUEST BODY JSON:**
```json
{
  "branchId": 5,
  "tableId": 10
}
```

**DTO:** `StartSessionRequest`
- `branchId` (Long, **REQUIRED**, `@NotNull`) - Branch ID
- `tableId` (Long, **REQUIRED**, `@NotNull`) - Table ID

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**RESPONSE:** `StartSessionResponse` with `guestSessionId` and `restaurantId`

---

### 61. End Session
**ENDPOINT:**
```
POST /api/customer/session/end
```

**REQUEST BODY JSON:**
```json
{
  "guestSessionId": "session-uuid-123"
}
```

**DTO:** `EndSessionRequest` (inner class in CustomerController)
- `guestSessionId` (String, **REQUIRED**) - Guest session ID

**PATH VARIABLES:** None

**QUERY PARAMS:** None

---

### 62. Get Menu (Customer)
**ENDPOINT:**
```
GET /api/customer/menu?branchId={branchId}&tableId={tableId}
```

**REQUEST BODY JSON:** None

**PATH VARIABLES:** None

**QUERY PARAMS:**
- `branchId` (Long, **REQUIRED**) - Branch ID
- `tableId` (Long, **REQUIRED**) - Table ID

---

### 63. Create Customer Order
**ENDPOINT:**
```
POST /api/customer/orders
```

**REQUEST BODY JSON:**
```json
{
  "guestSessionId": "session-uuid-123",
  "branchId": 5,
  "tableId": 10,
  "items": [
    {
      "menuItemId": 100,
      "qty": 2
    }
  ]
}
```

**DTO:** `CreateOrderRequest`
- `guestSessionId` (String, **REQUIRED**, `@NotNull`) - Guest session ID
- `branchId` (Long, **REQUIRED**, `@NotNull`) - Branch ID
- `tableId` (Long, **REQUIRED**, `@NotNull`) - Table ID
- `items` (List<OrderItemRequest>, **REQUIRED**, `@NotEmpty`, `@Valid`) - Order items

**OrderItemRequest (inner class):**
- `menuItemId` (Long, **REQUIRED**, `@NotNull`) - Menu item ID
- `qty` (Integer, **REQUIRED**, `@NotNull`) - Quantity

**PATH VARIABLES:** None

**QUERY PARAMS:** None

---

## 🏢 Plateful Admin Endpoints (`/api/plateful-admin`)

**NOTE:** These endpoints are only active when `plateful-admin` profile is enabled.

### 64. Create Restaurant with Superadmin
**ENDPOINT:**
```
POST /api/plateful-admin/restaurants
```

**REQUEST BODY JSON:**
```json
{
  "restaurantName": "New Restaurant",
  "superadminEmail": "superadmin@example.com",
  "superadminPassword": "SuperAdmin123!",
  "timezone": "UTC",
  "currency": "USD",
  "settingsJson": "{\"theme\":\"dark\"}"
}
```

**DTO:** `CreateRestaurantWithSuperAdminRequest`
- `restaurantName` (String, **REQUIRED**, `@NotBlank`) - Restaurant name
- `superadminEmail` (String, **REQUIRED**, `@NotBlank`, `@Email`) - Superadmin email
- `superadminPassword` (String, **REQUIRED**, `@NotBlank`) - Superadmin password
- `timezone` (String, **OPTIONAL**) - Timezone
- `currency` (String, **OPTIONAL**) - Currency code
- `settingsJson` (String, **OPTIONAL**) - JSON settings string

**PATH VARIABLES:** None

**QUERY PARAMS:** None

**PROFILE:** `@Profile("plateful-admin")`

---

### 65. Create Admin for Branch
**ENDPOINT:**
```
POST /api/plateful-admin/branches/{branchId}/admins
```

**REQUEST BODY JSON:**
```json
{
  "adminEmail": "admin@example.com",
  "adminPassword": "Admin123!",
  "branchId": 5
}
```

**DTO:** `CreateAdminForBranchRequest`
- `adminEmail` (String, **REQUIRED**, `@NotBlank`, `@Email`) - Admin email
- `adminPassword` (String, **REQUIRED**, `@NotBlank`) - Admin password
- `branchId` (Long, **REQUIRED**, `@NotNull`) - Branch ID (also in path, set automatically)

**PATH VARIABLES:**
- `branchId` (Long) - Branch ID

**QUERY PARAMS:** None

**PROFILE:** `@Profile("plateful-admin")`

**NOTE:** `branchId` in body is set to match path variable

---

## 📊 Summary

### Total Endpoints: 65

### By Category:
- **Authentication:** 3 endpoints
- **User Management:** 8 endpoints
- **Superadmin Dashboard:** 17 endpoints
- **Restaurant:** 5 endpoints
- **Branch:** 6 endpoints
- **Menu:** 6 endpoints
- **Table:** 5 endpoints
- **Order:** 8 endpoints
- **Payment:** 1 endpoint
- **Customer:** 4 endpoints
- **Plateful Admin:** 2 endpoints

### Key Endpoints for Admin Operations:

1. **Admin Creation:**
   - `POST /api/superadmin/users` - Create admin user
   - `POST /api/users` - Create user (general)

2. **Admin Password Reset:**
   - `POST /api/superadmin/admins/{adminId}/reset-password` - Reset admin password

3. **Branch Assignment:**
   - `POST /api/branches/{branchId}/assign-admin` - Assign admin to branch

---

## ✅ Validation Summary

### Common Validations:
- `@NotBlank` - String cannot be null, empty, or whitespace
- `@NotNull` - Field cannot be null
- `@Email` - Must be valid email format
- `@Size(min = 6)` - Minimum length (for passwords)
- `@Min(1)` - Minimum numeric value
- `@Positive` - Must be positive number
- `@Pattern` - Regex pattern validation (for order status)

### Field Types:
- **String** - Text fields
- **Long** - Numeric IDs and large integers
- **Integer** - Small integers (quantities, counts)
- **BigDecimal** - Decimal numbers (salaries, prices)
- **Boolean** - True/false values
- **LocalDate** - Date values (format: "YYYY-MM-DD")
- **Enum** - Predefined values (SalaryPeriod, AnalyticsGranularity, OrderStatus)

---

**Documentation Complete** ✅

All endpoint URLs, request bodies, path variables, query parameters, and validation rules have been documented.

