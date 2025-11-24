# How to Test QR-Based Customer Ordering & Kitchen Dashboard

This guide explains how to test the complete QR-based customer ordering flow and kitchen dashboard functionality.

## Prerequisites

1. **Backend API** must be running on `http://localhost:8080`
2. **Frontend** must be running on `http://localhost:3000`
3. Backend must have the following endpoints implemented:
   - `POST /api/customer/session/start`
   - `POST /api/customer/session/end`
   - `GET /api/customer/menu`
   - `POST /api/customer/orders`
   - `GET /api/kitchen/orders`
   - `PUT /api/kitchen/orders/{orderId}/accept`
   - `PUT /api/kitchen/orders/{orderId}/prepare`
   - `PUT /api/kitchen/orders/{orderId}/ready`
   - `GET /api/qr/table/{branchId}/{tableId}`

## Testing Flow

### Step 1: Generate QR Code

1. Open your browser and navigate to:
   ```
   http://localhost:3000/api/qr/table/{branchId}/{tableId}
   ```
   Replace `{branchId}` and `{tableId}` with actual IDs (e.g., `1` and `1`).

2. The response should contain:
   ```json
   {
     "qrUrl": "http://localhost:3000/customer/1/1",
     "qrImageBase64": "..."
   }
   ```

3. You can use a QR code generator to create a visual QR code from the `qrUrl`.

### Step 2: Customer Flow (No Authentication Required)

#### 2.1 Access Customer Menu

1. Navigate directly to the customer menu page:
   ```
   http://localhost:3000/customer/{branchId}/{tableId}
   ```
   Or scan the QR code generated in Step 1.

2. The page should:
   - Automatically start a guest session
   - Display available menu items grouped by category
   - Show a cart button with item count

#### 2.2 Add Items to Cart

1. Click "Add to Cart" on any menu item
2. The cart count should increase
3. Cart data is stored in localStorage

#### 2.3 View Cart

1. Click the "Cart" button in the header
2. You should see:
   - All items in the cart
   - Quantity controls (+/-)
   - Total price
   - "Place Order" button

3. Test cart operations:
   - Increase/decrease quantities
   - Remove items
   - Verify total updates correctly

#### 2.4 Place Order

1. Click "Place Order"
2. The order should be submitted to the backend
3. You should be redirected to the checkout page

#### 2.5 Checkout & Payment

1. On the checkout page, select a payment method
2. Click "Complete Payment"
3. The session should end
4. You should see a success message
5. Cart and session data should be cleared

### Step 3: Kitchen Dashboard (No Authentication Required)

#### 3.1 Access Kitchen Dashboard

1. Navigate to:
   ```
   http://localhost:3000/kitchen/{branchId}
   ```
   Replace `{branchId}` with the actual branch ID.

2. The dashboard should:
   - Display all non-completed orders for the branch
   - Auto-refresh every 5 seconds
   - Show order details: ID, table number, items, total, status

#### 3.2 Process Orders

1. **Accept Order** (Status: PENDING → ACCEPTED):
   - Click "Accept Order" button
   - Status should change to "Accepted"
   - Button should change to "Start Preparing"

2. **Start Preparing** (Status: ACCEPTED → PREPARING):
   - Click "Start Preparing" button
   - Status should change to "Preparing"
   - Button should change to "Mark as Ready"

3. **Mark as Ready** (Status: PREPARING → READY_TO_SERVE):
   - Click "Mark as Ready" button
   - Status should change to "Ready to Serve"
   - Order should show "Ready for Service" message

4. **Order Completion**:
   - Once order is marked as READY_TO_SERVE, it should remain visible until marked as COMPLETED by the backend
   - Orders with status COMPLETED are automatically filtered out

## API Testing with HTTP Files

### Using VS Code REST Client Extension

1. Install the "REST Client" extension in VS Code
2. Open `test-customer.http` or `test-kitchen.http`
3. Click "Send Request" above each request

### Manual Testing with cURL

#### Customer Session Start
```bash
curl -X POST http://localhost:3000/api/customer/session/start \
  -H "Content-Type: application/json" \
  -d '{"branchId": 1, "tableId": 1}'
```

#### Get Customer Menu
```bash
curl "http://localhost:3000/api/customer/menu?branchId=1&tableId=1"
```

#### Create Order
```bash
curl -X POST http://localhost:3000/api/customer/orders \
  -H "Content-Type: application/json" \
  -d '{
    "guestSessionId": "session-1234567890-abc123",
    "branchId": 1,
    "tableId": 1,
    "items": [{"menuItemId": 1, "qty": 2}]
  }'
```

#### Get Kitchen Orders
```bash
curl "http://localhost:3000/api/kitchen/orders?branchId=1"
```

#### Accept Order
```bash
curl -X PUT http://localhost:3000/api/kitchen/orders/1/accept
```

#### Prepare Order
```bash
curl -X PUT http://localhost:3000/api/kitchen/orders/1/prepare
```

#### Ready Order
```bash
curl -X PUT http://localhost:3000/api/kitchen/orders/1/ready
```

## Expected Behavior

### Customer Flow

1. **Session Management**:
   - Session is created automatically when accessing the menu page
   - Session is stored in localStorage
   - Session persists across page refreshes
   - Session is cleared after payment

2. **Cart Management**:
   - Cart is stored in localStorage
   - Cart persists across page navigation
   - Cart is cleared after order submission

3. **Order Submission**:
   - Order is sent to backend immediately
   - Cart is cleared after successful submission
   - User is redirected to checkout

### Kitchen Dashboard

1. **Order Display**:
   - Only shows non-completed orders
   - Orders are grouped by status
   - Auto-refreshes every 5 seconds

2. **Status Updates**:
   - Status changes are immediate
   - Orders update in real-time
   - Completed orders are automatically removed

## Troubleshooting

### Issue: Session not starting

**Symptoms**: Error message "Failed to initialize session"

**Solutions**:
- Check backend is running on port 8080
- Verify endpoint `/api/customer/session/start` exists
- Check browser console for detailed error
- Verify branchId and tableId are valid

### Issue: Menu not loading

**Symptoms**: "Failed to load menu" error

**Solutions**:
- Verify branchId and tableId exist in database
- Check table belongs to branch
- Verify menu items exist for the restaurant
- Check backend endpoint `/api/customer/menu`

### Issue: Orders not appearing in kitchen

**Symptoms**: Kitchen dashboard shows "No active orders"

**Solutions**:
- Verify order was created successfully
- Check order status is not COMPLETED
- Verify branchId matches order's branchId
- Check backend endpoint `/api/kitchen/orders`

### Issue: Status update fails

**Symptoms**: Button click doesn't change status

**Solutions**:
- Check orderId is valid
- Verify order status allows the transition
- Check backend endpoint exists
- Review browser console for errors

## Validation Checklist

- [ ] QR code generation works
- [ ] Customer can access menu without login
- [ ] Session starts automatically
- [ ] Menu items display correctly
- [ ] Cart functionality works (add/remove/update)
- [ ] Order submission works
- [ ] Checkout and payment work
- [ ] Session ends after payment
- [ ] Kitchen dashboard accessible without login
- [ ] Orders appear in kitchen dashboard
- [ ] Status updates work (accept/prepare/ready)
- [ ] Auto-refresh works in kitchen
- [ ] Completed orders are filtered out
- [ ] All data persists correctly in localStorage

## Notes

- **No Authentication Required**: Both customer and kitchen flows work without login
- **Session Format**: Guest sessions use format `session-{timestamp}-{random}`
- **Order Status Flow**: PENDING → ACCEPTED → PREPARING → READY_TO_SERVE → COMPLETED
- **Data Persistence**: Cart and session data use localStorage
- **Auto-refresh**: Kitchen dashboard refreshes every 5 seconds
- **Real-time Updates**: Orders appear in kitchen immediately after customer submission

