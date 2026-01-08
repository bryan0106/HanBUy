# Mock Data Setup - Localhost vs Production

## ✅ Implementation Complete

Your application now automatically uses:
- **Mock data** when running on **localhost** (development)
- **Real API** when deployed on **Vercel** (production)

## How It Works

### Environment Detection

The system uses `src/utils/env.ts` to detect the environment:

```typescript
// Detects if running on localhost
shouldUseMockData() // Returns true on localhost, false on production
```

### Automatic Switching

**On Localhost:**
- Uses mock data from `src/lib/mockData.ts`
- Uses test accounts from `src/lib/testData.ts`
- No API calls are made
- Fast development without backend dependency

**On Production (Vercel):**
- Uses real API from `https://hanbuyapi.onrender.com/api`
- Makes actual HTTP requests
- Connects to real database
- Full functionality

## Services Updated

### ✅ Product Service
- **Localhost**: Uses `mockServices.getProducts()` and `mockServices.getProduct()`
- **Production**: Calls `/api/products` endpoint

### ✅ Cart Service
- **Localhost**: Returns empty cart array
- **Production**: Calls `/api/cart` endpoint

### ✅ Auth Service
- **Localhost**: Uses test accounts from `testAccounts`
  - Admin: `admin@hanbuy.com` / `admin123`
  - Customers: See `src/lib/testData.ts`
- **Production**: Calls `/api/auth/login` endpoint

## Test Accounts (Localhost Only)

### Admin Account
- **Email**: `admin@hanbuy.com`
- **Password**: `admin123` or `admin`
- **Role**: Admin

### Customer Accounts
Check `src/lib/testData.ts` for customer test accounts:
- Multiple test customers available
- All have `approval_status: "approved"`

## How to Test

### Local Development (Mock Data)
1. Run `npm run dev`
2. Visit `http://localhost:3000`
3. Console will show: `📦 Using mock data for products (localhost)`
4. Login with test accounts
5. Browse products (mock data)

### Production (Real API)
1. Deploy to Vercel
2. Visit your Vercel URL
3. Console will show: `🔗 Backend API URL: https://hanbuyapi.onrender.com/api`
4. Login with real accounts
5. Browse products from database

## Override Mock Data (Optional)

If you want to force real API even on localhost, set environment variable:

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
```

Or to force mock data even in production (for testing):

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

## Benefits

1. **Fast Development**: No need to run backend locally
2. **Offline Development**: Works without internet connection
3. **Consistent Data**: Same mock data every time
4. **Easy Testing**: Test accounts ready to use
5. **Production Ready**: Automatically switches to real API when deployed

## Console Messages

You'll see different messages based on environment:

**Localhost:**
```
📦 Using mock data for products (localhost)
🛒 Using mock data for cart (localhost)
✅ Mock login successful (Admin) - Using localhost mock data
```

**Production:**
```
🔗 Backend API URL: https://hanbuyapi.onrender.com/api
(No mock data messages)
```

## Troubleshooting

### Issue: Still using real API on localhost
- Check browser console for environment detection
- Verify `window.location.hostname` is `localhost`
- Check if `NEXT_PUBLIC_USE_MOCK_DATA` is set

### Issue: Using mock data in production
- Check Vercel environment variables
- Verify `NEXT_PUBLIC_USE_MOCK_DATA` is not set to `true`
- Check `window.location.hostname` is not localhost

### Issue: Mock data not working
- Check `src/lib/mockData.ts` exists
- Verify `mockServices` is exported
- Check console for errors

## Next Steps

1. **Test locally** with mock data
2. **Deploy to Vercel** to test with real API
3. **Verify** both environments work correctly
4. **Update mock data** as needed for testing

## Files Modified

- ✅ `src/utils/env.ts` - Environment detection
- ✅ `src/services/productService.ts` - Mock data support
- ✅ `src/services/cartService.ts` - Mock data support
- ✅ `src/services/authService.ts` - Mock login support

## Files Used

- `src/lib/mockData.ts` - Mock products, boxes, invoices
- `src/lib/testData.ts` - Test users and accounts
