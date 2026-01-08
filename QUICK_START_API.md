# Quick Start: API Integration

## 🚀 Setup (1 minute)

1. **Create `.env.local` file** in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

2. **That's it!** The API integration is already complete.

## 📖 Quick Usage Examples

### Authentication
```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, login, logout, isAuthenticated } = useAuth();
```

### Products
```typescript
import { useProducts } from '@/hooks/useProducts';

const { products, loading, error } = useProducts({ page: 1, limit: 20 });
```

### Cart
```typescript
import { useCart } from '@/hooks/useCart';

const { cartItems, addToCart, removeCartItem, getTotal } = useCart(userId);
```

### Orders
```typescript
import { useOrders } from '@/hooks/useOrders';

const { orders, createOrder, loading } = useOrders({ user_id: userId });
```

### Direct Service Usage
```typescript
import { productService } from '@/services/productService';

const products = await productService.getProducts();
```

## 🔗 API Endpoints

- **Development**: `http://localhost:3001/api`
- **Production**: `https://hanbuyapi.onrender.com/api`

## ✅ What's Included

- ✅ 13 complete service files
- ✅ 4 React hooks (useAuth, useProducts, useCart, useOrders)
- ✅ API client with JWT token handling
- ✅ Error handler utility
- ✅ File upload support (FormData)
- ✅ Pagination support
- ✅ TypeScript types

## 📚 Full Documentation

See `API_INTEGRATION_SETUP.md` for complete documentation.
