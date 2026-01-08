# HanBuy Frontend API Integration Guide

This document describes the complete frontend API integration for the HanBuy e-commerce platform.

## Overview

The frontend API integration is built with:
- **Axios** for HTTP requests
- **TypeScript** for type safety
- **React Hooks** for state management
- **Centralized error handling**

## File Structure

```
src/
├── lib/
│   └── apiClient.ts          # Axios instance with interceptors
├── utils/
│   └── errorHandler.ts       # Error handling utilities
├── services/
│   ├── authService.ts        # Authentication endpoints
│   ├── userService.ts        # User management
│   ├── productService.ts     # Product endpoints
│   ├── cartService.ts        # Cart operations
│   ├── orderService.ts       # Order management
│   ├── paymentService.ts     # Payment operations
│   ├── invoiceService.ts     # Invoice management
│   ├── boxService.ts         # Box operations
│   ├── trackingService.ts    # Tracking operations
│   ├── shippingService.ts    # Shipping calculations
│   ├── documentService.ts   # Document uploads
│   ├── notificationService.ts # Notifications
│   ├── likedService.ts       # Wishlist operations
│   ├── utilityService.ts     # Utility endpoints
│   └── index.ts              # Service exports
└── hooks/
    ├── useAuth.ts            # Authentication hook
    ├── useProducts.ts        # Products hook
    ├── useCart.ts            # Cart management hook
    ├── useOrders.ts          # Orders hook
    └── index.ts              # Hook exports
```

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Production
NEXT_PUBLIC_API_URL=https://hanbuyapi.onrender.com/api
```

The API client automatically uses this environment variable. If not set, it defaults to the production URL.

## API Client

The API client (`src/lib/apiClient.ts`) is configured with:

- **Base URL**: From `NEXT_PUBLIC_API_URL` environment variable
- **Timeout**: 30 seconds
- **Request Interceptor**: Automatically adds JWT token from localStorage
- **Response Interceptor**: Handles 401 errors by clearing tokens and redirecting to login

### Usage

```typescript
import apiClient from '@/lib/apiClient';

// The client automatically includes the JWT token
const response = await apiClient.get('/products');
```

## Error Handling

All services use the centralized error handler (`src/utils/errorHandler.ts`):

```typescript
import { handleApiError, getErrorMessage } from '@/utils/errorHandler';

try {
  await someService.someMethod();
} catch (error) {
  const apiError = handleApiError(error);
  console.error(apiError.message);
  // Or use the helper
  console.error(getErrorMessage(error));
}
```

## Services

All services follow a consistent pattern:

1. Import `apiClient` and `handleApiError`
2. Use TypeScript interfaces for request/response types
3. Handle errors consistently
4. Return typed data

### Authentication Service

```typescript
import { authService } from '@/services/authService';

// Login
const response = await authService.login(email, password);
// Token is automatically stored in localStorage

// Register
const response = await authService.register({
  email,
  password,
  name,
  phone,
});

// Get current user
const user = await authService.getCurrentUser();

// Logout
await authService.logout();
// Token and user data are automatically cleared
```

### Product Service

```typescript
import { productService } from '@/services/productService';

// Get all products
const response = await productService.getProducts({
  category: 'electronics',
  page: 1,
  limit: 20,
});

// Get single product
const product = await productService.getProductById(productId);

// Get onhand products
const response = await productService.getOnhandProducts();

// Get preorder products
const response = await productService.getPreorderProducts();

// Get price comparison
const comparison = await productService.getKrComparison(productId);
```

### Cart Service

```typescript
import { cartService } from '@/services/cartService';

// Get cart items
const items = await cartService.getCartItems(userId);

// Add to cart
const item = await cartService.addToCart({
  user_id: userId,
  product_id: productId,
  quantity: 1,
  box_type_preference: 'solo',
});

// Update cart item
await cartService.updateCartItem(cartItemId, 2);

// Remove from cart
await cartService.removeCartItem(cartItemId);
```

### Order Service

```typescript
import { orderService } from '@/services/orderService';

// Get orders
const response = await orderService.getOrders({
  user_id: userId,
  status: 'pending',
});

// Get single order
const order = await orderService.getOrderById(orderId);

// Create order
const order = await orderService.createOrder({
  user_id: userId,
  order_number: 'ORD-123',
  // ... other order data
});

// Update order status (Admin only)
await orderService.updateOrderStatus(orderId, 'shipped');
```

### Payment Service

```typescript
import { paymentService } from '@/services/paymentService';

// Generate QR code
const qrData = await paymentService.generateQRCode({
  order_id: orderId,
  amount: 1000,
  payment_method: {
    type: 'qr_code',
    bank: 'GCASH',
  },
});

// Confirm payment with proof
const payment = await paymentService.confirmPayment({
  order_id: orderId,
  amount: 1000,
  payment_method: {
    type: 'bank_transfer',
    bank: 'BPI',
  },
  payment_proof: file, // File object
});

// Get payment status
const status = await paymentService.getPaymentStatus(paymentId);
```

### File Uploads

Services that handle file uploads use `FormData`:

```typescript
// Payment proof upload
const formData = new FormData();
formData.append('order_id', orderId);
formData.append('amount', amount.toString());
formData.append('payment_method', JSON.stringify(paymentMethod));
formData.append('payment_proof', file);

// Document upload
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'id');
formData.append('description', 'National ID');
```

## React Hooks

### useAuth Hook

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isAdmin, loading, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <button onClick={() => login(email, password)}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### useProducts Hook

```typescript
import { useProducts } from '@/hooks/useProducts';

function ProductsPage() {
  const { products, loading, error, pagination, refetch } = useProducts({
    category: 'electronics',
    page: 1,
    limit: 20,
  });

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### useCart Hook

```typescript
import { useCart } from '@/hooks/useCart';

function CartPage() {
  const userId = 'user-id';
  const {
    cartItems,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeCartItem,
    getTotal,
    getItemCount,
  } = useCart(userId);

  const total = getTotal();
  const itemCount = getItemCount();

  return (
    <div>
      <h2>Cart ({itemCount} items)</h2>
      <p>Total: ${total}</p>
      {cartItems.map(item => (
        <CartItem
          key={item.id}
          item={item}
          onUpdate={(quantity) => updateCartItem(item.id, quantity)}
          onRemove={() => removeCartItem(item.id)}
        />
      ))}
    </div>
  );
}
```

### useOrders Hook

```typescript
import { useOrders } from '@/hooks/useOrders';

function OrdersPage() {
  const { orders, loading, error, createOrder } = useOrders({
    user_id: userId,
  });

  const handleCreateOrder = async () => {
    const order = await createOrder({
      user_id: userId,
      // ... order data
    });
    if (order) {
      console.log('Order created:', order);
    }
  };

  return (
    <div>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

## Authentication Flow

1. **Login**: User logs in with email/password
   - Token is stored in `localStorage` as `hanbuy_token`
   - User data is stored in `localStorage` as `hanbuy_user`

2. **Automatic Token Inclusion**: All API requests automatically include the token in the `Authorization` header

3. **Token Refresh**: If a 401 error occurs, the interceptor:
   - Clears tokens from localStorage
   - Redirects to `/auth/login`

4. **Logout**: Clears tokens and user data from localStorage

## Response Format

All API responses follow this format:

```typescript
{
  success: boolean;
  data: T; // The actual data
  message?: string; // Optional message
  error?: string; // Error message if success is false
}
```

Paginated responses include:

```typescript
{
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Error Handling Best Practices

1. **Always use try-catch** when calling services:

```typescript
try {
  const product = await productService.getProductById(id);
} catch (error) {
  const errorMessage = handleApiError(error).message;
  // Show error to user
}
```

2. **Use hooks for automatic error handling**:

```typescript
const { products, error, loading } = useProducts();
// Error is automatically handled and available in the error state
```

3. **Handle specific error types**:

```typescript
import { isNetworkError, isAuthError, isTimeoutError } from '@/utils/errorHandler';

if (isNetworkError(error)) {
  // Show network error message
} else if (isAuthError(error)) {
  // Redirect to login
} else if (isTimeoutError(error)) {
  // Show timeout message
}
```

## TypeScript Types

All services export TypeScript interfaces for:
- Request parameters
- Response data
- Entity types (User, Product, Order, etc.)

Import types as needed:

```typescript
import type { Product, GetProductsParams } from '@/services/productService';
import type { Order, CreateOrderRequest } from '@/services/orderService';
```

## Testing

To test the API integration:

1. **Set up environment variable**:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

2. **Start the backend server**

3. **Test authentication**:
   ```typescript
   const response = await authService.login('test@example.com', 'password');
   ```

4. **Test other endpoints** using the services or hooks

## Migration from Old API

If you're migrating from the old `src/services/api.ts`:

1. Replace imports:
   ```typescript
   // Old
   import { productService } from '@/services/api';
   
   // New
   import { productService } from '@/services/productService';
   ```

2. Update hook usage:
   ```typescript
   // Old
   const { user } = useAuth(); // from lib/auth
   
   // New
   const { user } = useAuth(); // from hooks/useAuth (updated)
   ```

3. The new services return data in a consistent format with proper TypeScript types.

## Troubleshooting

### Token not being sent

- Check that token exists in localStorage: `localStorage.getItem('hanbuy_token')`
- Verify the request interceptor is working (check Network tab in DevTools)

### 401 Errors

- Token may be expired or invalid
- User may need to log in again
- Check backend token validation

### Network Errors

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend server is running
- Verify CORS configuration on backend

### Type Errors

- Ensure all TypeScript types are imported correctly
- Check service method signatures match API responses

## Support

For issues or questions:
1. Check the error message from `handleApiError`
2. Review the Network tab in browser DevTools
3. Check backend API logs
4. Verify environment variables are set correctly
