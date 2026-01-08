# API Response Examples & Usage Guide

## Quick Reference: API Response Format

### List Products Response (Optimized)

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod-123",
        "name": "COSRX Advanced Snail 96 Mucin Power Essence",
        "sku": "COSRX-SNAIL-96",
        "price": 25000,
        "currency": "KRW",
        "php_price": 1050,
        "images": [
          {
            "url": "https://example.com/image.jpg",
            "is_primary": true
          }
        ],
        "category": {
          "id": "cat-1",
          "name": "Skincare",
          "slug": "skincare"
        },
        "brand": {
          "id": "brand-1",
          "name": "COSRX",
          "slug": "cosrx"
        },
        "product_type": "onhand",
        "status": "active",
        "stock": {
          "available": 50,
          "total": 55,
          "location": "warehouse-a"
        },
        "stores": [
          {
            "store_id": "store-1",
            "store_name": "Manila Warehouse",
            "store_location": "Manila, Philippines",
            "stock": 30,
            "available": true
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "total_pages": 8,
      "has_next": true,
      "has_prev": false
    },
    "aggregations": {
      "categories": [
        { "id": "cat-1", "name": "Skincare", "count": 50 }
      ],
      "brands": [
        { "id": "brand-1", "name": "COSRX", "count": 30 }
      ]
    }
  }
}
```

### Preorder Product Response

```json
{
  "id": "prod-preorder-123",
  "name": "Limited Edition K-Beauty Set",
  "product_type": "preorder",
  "stock": {
    "available": 30,
    "total": 50
  },
  "preorder": {
    "order_deadline": "2024-12-31T23:59:59Z",
    "release_date": "2025-01-15T00:00:00Z",
    "days_until_release": 15,
    "is_deadline_passed": false
  },
  "stores": [
    {
      "store_id": "store-kr-1",
      "store_name": "Korea Warehouse",
      "stock": 30,
      "available": true
    }
  ]
}
```

## Frontend Usage Examples

### 1. Fetch Onhand Products with Store Info

```typescript
// In your component
const loadOnhandProducts = async () => {
  const response = await productService.getOnhandProducts({
    page: 1,
    limit: 20,
    category: 'skincare',
    // Optionally filter by store
    store_id: selectedStoreId
  });
  
  const products = response.data.products;
  const pagination = response.data.pagination;
  const stores = products.flatMap(p => p.stores || []);
};
```

### 2. Display Product with Store Information

```typescript
// In ProductCard component
{product.stores && product.stores.length > 0 && (
  <div className="store-info">
    <span className="text-sm text-muted-foreground">Available at:</span>
    <div className="flex gap-2">
      {product.stores.map(store => (
        <span key={store.store_id} className="badge">
          {store.store_name} ({store.stock} in stock)
        </span>
      ))}
    </div>
  </div>
)}
```

### 3. Use Aggregations for Filters

```typescript
// Get available categories and brands from API
const { categories, brands } = response.data.aggregations || {};

// Use in filter dropdowns
<select>
  {categories.map(cat => (
    <option key={cat.id} value={cat.slug}>
      {cat.name} ({cat.count})
    </option>
  ))}
</select>
```

### 4. Implement Infinite Scroll

```typescript
const [products, setProducts] = useState<Product[]>([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  if (!hasMore || loading) return;
  
  const response = await productService.getProducts({
    product_type: 'onhand',
    page: page + 1,
    limit: 20
  });
  
  setProducts(prev => [...prev, ...response.data.products]);
  setHasMore(response.data.pagination.has_next);
  setPage(page + 1);
};
```

### 5. Filter Products by Store/Warehouse

```typescript
// Filter products available in specific store
const getProductsByStore = async (storeId: string) => {
  const response = await productService.getProducts({
    store_id: storeId,
    product_type: 'onhand',
    include_out_of_stock: false
  });
  
  return response.data.products;
};
```

### 6. Admin DataTable Usage

```typescript
// For admin inventory management
const loadInventoryData = async (page: number, limit: number) => {
  const response = await productService.getProducts({
    page,
    limit,
    include_out_of_stock: true,
    sort: 'created_desc'
  });
  
  // Transform for DataTable
  const tableData = response.data.products.map(product => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category.name,
    brand: product.brand?.name || '-',
    price: product.price,
    stock: product.stock.available,
    stores: product.stores?.map(s => s.store_name).join(', ') || '-',
    status: product.status,
    product_type: product.product_type
  }));
  
  return {
    data: tableData,
    total: response.data.pagination.total,
    page: response.data.pagination.page
  };
};
```

## API Call Patterns

### Pattern 1: Get All Products (Home Page)
```
GET /api/products?page=1&limit=20&sort=created_desc
```

### Pattern 2: Get Onhand Products (Store Page)
```
GET /api/products?product_type=onhand&page=1&limit=20
```

### Pattern 3: Get Preorder Products
```
GET /api/products?product_type=preorder&page=1&limit=20
```

### Pattern 4: Filter by Category and Brand
```
GET /api/products?category=skincare&brand=cosrx&page=1&limit=20
```

### Pattern 5: Search with Price Range
```
GET /api/products?search=snail&min_price=10000&max_price=30000&page=1&limit=20
```

### Pattern 6: Get Products by Store
```
GET /api/products?store_id=store-1&product_type=onhand&page=1&limit=20
```

### Pattern 7: Admin Inventory View
```
GET /api/products?page=1&limit=50&include_out_of_stock=true&sort=created_desc
```

## Key Benefits

1. **Single Endpoint**: All product queries use `/api/products` with different parameters
2. **Reduced Calls**: Get filters, products, and pagination in one request
3. **Store Information**: Products include store/warehouse data when needed
4. **Optimized Payload**: Only send necessary fields
5. **Server-Side Filtering**: Better performance for large catalogs
6. **Pagination Ready**: Built-in pagination support
7. **DataTable Friendly**: Aggregations perfect for admin views

## Migration Guide

### Step 1: Update productService.ts
- Replace separate `getOnhandProducts` and `getPreorderProducts` with unified `getProducts`
- Add new Product interface with stores array
- Keep convenience methods that call unified endpoint

### Step 2: Update Product Pages
- Replace `getOnhandProducts()` with `getProducts({ product_type: 'onhand' })`
- Replace `getPreorderProducts()` with `getProducts({ product_type: 'preorder' })`
- Add server-side filtering instead of client-side

### Step 3: Add Store Information Display
- Show store names in product cards when available
- Add store filter in admin panel
- Display stock per store in product details

### Step 4: Implement Pagination
- Replace full product load with paginated requests
- Add infinite scroll or "Load More" button
- Update URL params for pagination state

### Step 5: Use Aggregations
- Replace hardcoded categories/brands with API aggregations
- Update filter dropdowns to use aggregation data
- Show counts in filter options

