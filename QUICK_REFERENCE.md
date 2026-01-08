# Quick Reference: Best API Response Format for Products

## ✅ Recommended API Response Structure

```typescript
// Single unified endpoint: GET /api/products
// Handles: onhand, preorder, kr_website products

Response Structure:
{
  success: true,
  data: {
    products: [
      {
        // Core fields
        id, name, sku, description, price, currency, php_price,
        
        // Product classification
        product_type: "onhand" | "preorder" | "kr_website",
        status: "active" | "inactive" | "out_of_stock",
        
        // Store/Warehouse Information ⭐ KEY FEATURE
        stores: [
          {
            store_id: string,
            store_name: string,
            store_location: string,
            stock: number,
            available: boolean
          }
        ],
        
        // Inventory
        stock: {
          available: number,
          total: number,
          location: string
        },
        
        // Preorder-specific (only if product_type === "preorder")
        preorder: {
          order_deadline: string,
          release_date: string,
          days_until_release: number
        },
        
        // Other fields...
        images, category, brand, weight, dimensions, etc.
      }
    ],
    
    // Pagination
    pagination: {
      page: number,
      limit: number,
      total: number,
      total_pages: number,
      has_next: boolean,
      has_prev: boolean
    },
    
    // Aggregations for filters (optional but recommended)
    aggregations: {
      categories: Array<{ id, name, count }>,
      brands: Array<{ id, name, count }>,
      price_range: { min, max }
    }
  }
}
```

## 🎯 How to Call API

### Get Onhand Products
```typescript
const response = await productService.getProducts({
  product_type: 'onhand',
  page: 1,
  limit: 20
});
```

### Get Preorder Products
```typescript
const response = await productService.getProducts({
  product_type: 'preorder',
  page: 1,
  limit: 20
});
```

### Get Products by Store
```typescript
const response = await productService.getProducts({
  store_id: 'store-1',
  product_type: 'onhand',
  page: 1,
  limit: 20
});
```

### With Filters
```typescript
const response = await productService.getProducts({
  product_type: 'onhand',
  category: 'skincare',
  brand: 'cosrx',
  min_price: 10000,
  max_price: 50000,
  search: 'snail',
  page: 1,
  limit: 20,
  sort: 'price_asc'
});
```

## 📊 Display Store Information

```typescript
// In your ProductCard component
{product.stores && product.stores.length > 0 && (
  <div>
    <span>Available at:</span>
    {product.stores.map(store => (
      <div key={store.store_id}>
        {store.store_name} - Stock: {store.stock}
      </div>
    ))}
  </div>
)}
```

## 🗂️ DataTable Usage (Admin)

```typescript
// For admin inventory DataTable
const response = await productService.getProducts({
  page: 1,
  limit: 50,
  include_out_of_stock: true,
  sort: 'created_desc'
});

// Transform for DataTable
const tableData = response.data.products.map(p => ({
  id: p.id,
  name: p.name,
  sku: p.sku,
  stock: p.stock.available,
  stores: p.stores?.map(s => s.store_name).join(', '),
  status: p.status,
  product_type: p.product_type
}));
```

## ✨ Key Benefits

1. ✅ **Single Endpoint**: One API for all product types
2. ✅ **Store Info**: Products include warehouse/store data
3. ✅ **Server Filtering**: Faster, more efficient
4. ✅ **Pagination**: Built-in pagination support
5. ✅ **Optimized**: Only send requested data
6. ✅ **Scalable**: Handles large catalogs
7. ✅ **DataTable Ready**: Perfect for admin views

## 🚀 Implementation Priority

1. **High Priority**: 
   - Unify endpoints (onhand + preorder)
   - Add store information to products
   - Implement server-side filtering

2. **Medium Priority**:
   - Add pagination
   - Create reusable ProductCard component
   - Update admin DataTable

3. **Low Priority**:
   - Add aggregations
   - Implement infinite scroll
   - Advanced filtering UI

