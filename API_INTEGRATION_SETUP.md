# API Integration Setup Complete ✅

This document confirms that the complete API integration for the HanBuy Next.js frontend has been set up and is ready to use.

## 📁 File Structure

All required files have been created and are located in the following structure:

```
lib/
  apiClient.ts ✅

services/
  authService.ts ✅
  productService.ts ✅
  cartService.ts ✅
  orderService.ts ✅
  paymentService.ts ✅
  invoiceService.ts ✅
  boxService.ts ✅
  trackingService.ts ✅
  shippingService.ts ✅
  documentService.ts ✅
  notificationService.ts ✅
  likedService.ts ✅
  userService.ts ✅
  utilityService.ts ✅

utils/
  errorHandler.ts ✅

hooks/
  useAuth.ts ✅
  useProducts.ts ✅
  useCart.ts ✅
  useOrders.ts ✅
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

For production, use:
```env
NEXT_PUBLIC_API_URL=https://hanbuyapi.onrender.com/api
```

**Note:** A `.env.example` file has been created as a template. Copy it to `.env.local` and update the values.

### API Client Configuration

The API client (`lib/apiClient.ts`) is configured with:
- ✅ Base URL from `NEXT_PUBLIC_API_URL` environment variable
- ✅ Request interceptor: Automatically adds JWT token from localStorage
- ✅ Response interceptor: Handles 401 errors (clears token, redirects to login)
- ✅ 30-second timeout
- ✅ Proper error handling

## 📋 Service Implementations

### ✅ Authentication Service (`authService.ts`)
- `login(email, password)` - User login
- `register(data)` - User registration
- `logout()` - User logout
- `getCurrentUser()` - Get current user
- `getMe()` - Alias for getCurrentUser

### ✅ Product Service (`productService.ts`)
- `getProducts(params?)` - Get all products with filters
- `getProductById(id)` - Get single product
- `getOnhandProducts(params?)` - Get onhand items only
- `getPreorderProducts(params?)` - Get preorder items only
- `getKrComparison(productId)` - Get KR price comparison

### ✅ Cart Service (`cartService.ts`)
- `getCartItems(userId)` - Get cart items
- `getCart(userId)` - Alias for getCartItems
- `addToCart(data)` - Add item to cart
- `updateCartItem(cartItemId, quantity)` - Update cart item
- `removeCartItem(cartItemId)` - Remove item from cart
- `removeFromCart(cartItemId)` - Alias for removeCartItem

### ✅ Order Service (`orderService.ts`)
- `getOrders(params?)` - Get orders with filters
- `getOrderById(id)` - Get single order
- `createOrder(data)` - Create new order
- `updateOrderStatus(id, status)` - Update order status

### ✅ Payment Service (`paymentService.ts`)
- `generateQRCode(data)` - Generate QR code for payment
- `confirmPayment(data)` - Confirm payment with file upload (FormData)
- `getPaymentStatus(paymentId)` - Get payment status
- `getPayment(paymentId)` - Alias for getPaymentStatus

### ✅ Invoice Service (`invoiceService.ts`)
- `getInvoices(params?)` - Get invoices with filters
- `getInvoiceById(id)` - Get single invoice
- `getInvoicePDF(id)` - Get invoice PDF (returns Blob)
- `downloadInvoicePDF(id)` - Alias for getInvoicePDF
- `createInvoice(data)` - Create invoice (Admin)
- `updateInvoiceStatus(id, status)` - Update invoice status

### ✅ Box Service (`boxService.ts`)
- `getBoxes(params?)` - Get boxes with filters
- `getBoxById(id)` - Get single box
- `createBox(data)` - Create new box
- `updateBoxStatus(id, status)` - Update box status
- `getBoxPenalty(id)` - Get box penalty information

### ✅ Tracking Service (`trackingService.ts`)
- `getTracking(trackingNumber)` - Get tracking info
- `addIncomingPackage(data)` - Add incoming package
- `getOutgoingPackages(params?)` - Get outgoing packages

### ✅ Shipping Service (`shippingService.ts`)
- `calculateShippingQuote(data)` - Calculate shipping quote
- `calculateCBM(data)` - Calculate CBM (Cubic Meters)

### ✅ Document Service (`documentService.ts`)
- `uploadDocument(data)` - Upload document (FormData)
- `getDocuments(params?)` - Get documents with filters
- `getDocumentById(id)` - Get single document
- `deleteDocument(id)` - Delete document

### ✅ Notification Service (`notificationService.ts`)
- `getNotifications(params?)` - Get notifications with filters
- `markNotificationRead(id)` - Mark notification as read
- `getNotificationPreferences()` - Get notification preferences
- `updateNotificationPreferences(preferences)` - Update preferences

### ✅ Liked Service (`likedService.ts`)
- `getLikedItems(params?)` - Get liked items (wishlist)
- `addToLiked(productId)` - Add item to liked list
- `removeFromLiked(productId)` - Remove from liked list

### ✅ User Service (`userService.ts`)
- `getUsers(params?)` - Get users with filters (Admin)
- `getUserById(id)` - Get single user
- `updateUser(id, updates)` - Update user information

### ✅ Utility Service (`utilityService.ts`)
- `getBankTypes()` - Get all bank types
- `getBoxTypes()` - Get all box types
- `healthCheck()` - Health check endpoint

## 🎣 React Hooks

### ✅ useAuth Hook
- Manages authentication state
- Provides `user`, `isAuthenticated`, `isAdmin`, `isCustomer`
- Methods: `login()`, `logout()`, `refetch()`
- Handles localStorage caching

### ✅ useProducts Hook
- Manages products state with loading/error
- Provides `products`, `loading`, `error`, `pagination`
- Methods: `refetch()`, `getProduct()`, `getOnhandProducts()`, `getPreorderProducts()`

### ✅ useCart Hook
- Manages cart state
- Provides `cartItems`, `loading`, `error`
- Methods: `addToCart()`, `updateCartItem()`, `removeCartItem()`, `getTotal()`, `getItemCount()`

### ✅ useOrders Hook
- Manages orders state with pagination
- Provides `orders`, `loading`, `error`, `pagination`
- Methods: `refetch()`, `getOrder()`, `createOrder()`

## 🔒 Authentication

All API requests automatically include the JWT token from localStorage:
- Token is stored in `localStorage` as `hanbuy_token`
- Token is added to `Authorization: Bearer <token>` header
- On 401 errors, token is cleared and user is redirected to `/auth/login`

## 📤 File Uploads

File uploads are handled using `FormData`:
- Payment proof upload: `paymentService.confirmPayment()`
- Document upload: `documentService.uploadDocument()`

Example:
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'payment_proof');

await documentService.uploadDocument({
  file: file,
  type: 'payment_proof'
});
```

## 📄 API Response Format

All services handle the standard API response format:
```json
{
  "success": true|false,
  "data": {},
  "message": "Optional message",
  "error": "Error message if success is false",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 🚨 Error Handling

The `errorHandler.ts` utility provides:
- `handleApiError(error)` - Parse API errors and return user-friendly messages
- `getErrorMessage(error)` - Get error message string
- `isNetworkError(error)` - Check if network error
- `isTimeoutError(error)` - Check if timeout error
- `isAuthError(error)` - Check if authentication error

All services use `handleApiError()` for consistent error handling.

## 🎯 Usage Examples

### Using Services Directly
```typescript
import { productService } from '@/services/productService';

// Get products
const response = await productService.getProducts({ page: 1, limit: 20 });
console.log(response.data); // Product[]
console.log(response.pagination); // Pagination info
```

### Using React Hooks
```typescript
import { useProducts } from '@/hooks/useProducts';

function ProductsPage() {
  const { products, loading, error, pagination } = useProducts({ page: 1 });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Authentication
```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { login, loading, error } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
      // Redirect to dashboard
    } catch (err) {
      console.error('Login failed:', err);
    }
  };
}
```

## ✅ Next Steps

1. **Create `.env.local` file** with your API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

2. **Test the connection**:
   - Start your backend API server
   - Start your Next.js frontend: `npm run dev`
   - Check browser console for API URL confirmation

3. **Verify authentication**:
   - Try logging in through the UI
   - Check that token is stored in localStorage
   - Verify API requests include Authorization header

4. **Test services**:
   - Use the hooks in your components
   - Test file uploads (payment proof, documents)
   - Verify pagination works correctly

## 📝 Notes

- All services follow the same pattern for consistency
- TypeScript types are included for all services
- Error handling is centralized in `errorHandler.ts`
- JWT tokens are automatically managed by the API client
- File uploads use FormData for multipart/form-data
- Pagination is handled consistently across all list endpoints

## 🎉 Setup Complete!

Your API integration is now complete and ready to use. All services, hooks, and utilities are in place and follow best practices.
