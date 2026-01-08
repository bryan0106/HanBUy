# Product API Migration Summary

## ✅ Completed Updates

### 1. Type Definitions (`src/types/product.ts`)
- ✅ Created comprehensive Product types matching new API structure
- ✅ Includes all new fields: `php_price`, `price_conversion_rate`, structured `images`, `category`, `brand`, `stock`, `stores`, `preorder`, etc.
- ✅ Added `ProductDetail` interface for single product pages
- ✅ Added pagination and aggregation types

### 2. Product Service (`src/services/productService.ts`)
- ✅ Updated to use unified `/api/products` endpoint
- ✅ Added all new query parameters: `product_type`, `status`, `category`, `brand`, `search`, `sort`, `min_price`, `max_price`, `store_id`, `include_out_of_stock`
- ✅ Updated response handling to match new structure (`response.data.products`, `response.data.pagination`, `response.data.aggregations`)
- ✅ Added convenience methods: `getOnhandProducts`, `getPreorderProducts`, `getProductsByStore`, `searchProducts`, `getProductsByCategory`, `getProductsByBrand`, `getProductsByPriceRange`
- ✅ Fixed error handling (re-throw original errors)

### 3. React Hook (`src/hooks/useProducts.ts`)
- ✅ Updated to handle new response format
- ✅ Added `aggregations` to return value
- ✅ Added `loadMore` function for infinite scroll/pagination
- ✅ Updated pagination structure (`has_next`, `has_prev`, `total_pages`)
- ✅ Added `useProduct` hook for single product details

### 4. Product Utilities (`src/lib/productUtils.ts`)
- ✅ Created helper functions for backward compatibility:
  - `getProductImage()` - Handles both old string[] and new ProductImage[] formats
  - `getPrimaryImage()` - Gets primary image or first image
  - `getDisplayPrice()` - Uses `php_price` if available, otherwise calculates
  - `getDisplayCurrency()` - Returns PHP for KRW products
  - `getBrandName()` - Handles both string and object formats
  - `getCategoryName()` - Handles both string and object formats
  - `getAvailableStock()` - Handles both number and object formats
  - `isInStock()` - Checks if product is available

### 5. Products Page (`app/(store)/store/products/page.tsx`)
- ✅ Updated to use `useProducts` hook
- ✅ Removed client-side filtering (now server-side)
- ✅ Updated to use new product structure:
  - Images: Uses `getPrimaryImage()` utility
  - Prices: Uses `getDisplayPrice()` and `php_price`
  - Brand/Category: Uses `getBrandName()` utility
  - Stock: Uses `getAvailableStock()` utility
- ✅ Added pagination controls
- ✅ Added aggregations for category/brand filters
- ✅ Updated filter handling to reset page on filter change

## 🔄 Still Needs Updates

### Pages That Need Migration:
1. **`app/(store)/store/products/onhand/page.tsx`**
   - Update to use `useProducts` hook with `product_type: 'onhand'`
   - Update product display to use new structure
   - Remove client-side filtering

2. **`app/(store)/store/products/preorder/page.tsx`**
   - Update to use `useProducts` hook with `product_type: 'preorder'`
   - Update to use `preorder` object from API
   - Update product display to use new structure

3. **`app/(store)/store/products/[id]/page.tsx`**
   - Update to use `useProduct` hook
   - Update to use `ProductDetail` type
   - Update to use new image structure
   - Update to use `php_price` instead of calculating
   - Update to use structured `category`, `brand`, `stock` objects

### Components That May Need Updates:
- Any components that directly access `product.images[0]` should use `getPrimaryImage()`
- Any components that access `product.brand` or `product.category` as strings should use `getBrandName()` / `getCategoryName()`
- Any components that access `product.stock` as number should use `getAvailableStock()`

## 📝 Migration Notes

### Key Changes:
1. **Images**: Changed from `string[]` to `ProductImage[]` with `url`, `alt`, `is_primary`, `order`
2. **Category/Brand**: Changed from `string` to objects with `id`, `name`, `slug`
3. **Stock**: Changed from `number` to `ProductStock` object with `available`, `reserved`, `total`
4. **Price**: Now includes `php_price` and `price_conversion_rate` pre-calculated
5. **Pagination**: Uses `has_next`/`has_prev` instead of just page numbers
6. **Response Structure**: Products are now in `response.data.products` instead of `response.data`

### Backward Compatibility:
- Utility functions in `productUtils.ts` handle both old and new formats
- Old Product type is still exported as `ProductLegacy` for gradual migration
- Components can be updated incrementally using the utility functions

## 🚀 Next Steps

1. Update remaining product pages (onhand, preorder, detail)
2. Test all product-related functionality
3. Remove any remaining mock data usage
4. Update any admin pages that display products
5. Consider creating a shared `ProductCard` component for consistency

