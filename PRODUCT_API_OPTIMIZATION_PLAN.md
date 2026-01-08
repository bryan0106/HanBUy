# Product API & Display Optimization Plan

## Current Issues Identified

1. **Separate API Endpoints**: Onhand and Preorder products are fetched from different endpoints (`/products/onhand` and `/products/preorder`)
2. **No Store/Warehouse Information**: Products don't include store or warehouse location data
3. **Type Inconsistencies**: Multiple Product type definitions across the codebase
4. **Client-Side Filtering**: All filtering is done on the client, causing unnecessary data transfer
5. **No Pagination**: Products are loaded all at once, causing performance issues
6. **Duplicate Display Logic**: Same product display code is repeated across different pages

## Recommended API Response Format

### Unified Product Endpoint

**Endpoint**: `GET /api/products`

**Query Parameters**:
- `product_type`: `onhand` | `preorder` | `kr_website` | `all` (optional, default: `all`)
- `status`: `active` | `inactive` | `out_of_stock` (optional)
- `category`: string (optional)
- `brand`: string (optional)
- `search`: string (optional)
- `page`: number (optional, default: 1)
- `limit`: number (optional, default: 20, max: 100)
- `sort`: `price_asc` | `price_desc` | `name_asc` | `name_desc` | `created_desc` | `stock_desc` (optional)
- `min_price`: number (optional)
- `max_price`: number (optional)
- `store_id`: string (optional) - Filter by store/warehouse
- `include_out_of_stock`: boolean (optional, default: false)

**Optimized Response Format**:

```typescript
{
  "success": true,
  "data": {
    "products": [
      {
        // Core Product Info
        "id": "prod-123",
        "name": "Product Name",
        "description": "Product description",
        "sku": "SKU-123",
        
        // Pricing
        "price": 25000,
        "currency": "KRW",
        "php_price": 1050, // Pre-calculated PHP price
        "price_conversion_rate": 0.042,
        
        // Visual
        "images": [
          {
            "url": "https://...",
            "alt": "Main product image",
            "is_primary": true,
            "order": 1
          }
        ],
        
        // Classification
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
        
        // Inventory
        "product_type": "onhand", // or "preorder" | "kr_website"
        "status": "active", // or "inactive" | "out_of_stock"
        "stock": {
          "available": 50,
          "reserved": 5,
          "total": 55,
          "min_threshold": 10,
          "location": "warehouse-a" // Optional warehouse location
        },
        
        // Store/Warehouse Information (if applicable)
        "stores": [
          {
            "store_id": "store-1",
            "store_name": "Manila Warehouse",
            "store_location": "Manila, Philippines",
            "stock": 30,
            "available": true
          },
          {
            "store_id": "store-2",
            "store_name": "Korea Warehouse",
            "store_location": "Seoul, Korea",
            "stock": 20,
            "available": true
          }
        ],
        
        // Preorder-specific fields (only if product_type is "preorder")
        "preorder": {
          "order_deadline": "2024-12-31T23:59:59Z",
          "release_date": "2025-01-15T00:00:00Z",
          "expected_delivery": "2025-01-20T00:00:00Z",
          "days_until_release": 15,
          "is_deadline_passed": false
        },
        
        // Product Details
        "weight": 0.1, // kg
        "dimensions": {
          "length": 15,
          "width": 5,
          "height": 20,
          "unit": "cm"
        },
        
        // Variations (if any)
        "variations": [
          {
            "id": "var-1",
            "type": "size",
            "name": "Size",
            "value": "Large",
            "sku": "SKU-123-L",
            "price_modifier": 5000,
            "stock": 20,
            "image_url": "https://..."
          }
        ],
        
        // SEO & Metadata
        "seo_title": "SEO Title",
        "seo_description": "SEO Description",
        "tags": ["korean", "beauty", "skincare"],
        
        // Timestamps
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-12-20T00:00:00Z"
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
    "filters_applied": {
      "product_type": "onhand",
      "category": "skincare",
      "min_price": 1000,
      "max_price": 5000
    },
    "aggregations": {
      "total_products": 150,
      "price_range": {
        "min": 1000,
        "max": 50000
      },
      "categories": [
        { "id": "cat-1", "name": "Skincare", "count": 50 },
        { "id": "cat-2", "name": "Food", "count": 100 }
      ],
      "brands": [
        { "id": "brand-1", "name": "COSRX", "count": 30 },
        { "id": "brand-2", "name": "Beauty of Joseon", "count": 20 }
      ]
    }
  }
}
```

### Single Product Detail Endpoint

**Endpoint**: `GET /api/products/:id`

**Response**: Same structure as above, but with additional fields:

```typescript
{
  "success": true,
  "data": {
    // All fields from list endpoint plus:
    "full_description": "...", // HTML formatted
    "specifications": {
      "ingredients": "...",
      "usage": "...",
      "warnings": "..."
    },
    "related_products": [...], // Array of related products (same structure)
    "reviews": {
      "average_rating": 4.5,
      "total_reviews": 120,
      "rating_distribution": {
        "5": 80,
        "4": 25,
        "3": 10,
        "2": 3,
        "1": 2
      },
      "recent_reviews": [...] // Last 10 reviews
    },
    "price_comparison": {
      "our_price": 25000,
      "competitor_prices": [
        {
          "website": "Gmarket",
          "url": "https://...",
          "price": 28000,
          "currency": "KRW",
          "last_checked": "2024-12-20T00:00:00Z"
        }
      ],
      "best_price": 25000,
      "savings": 3000,
      "savings_percentage": 10.7
    }
  }
}
```

## Optimized Frontend Implementation

### 1. Unified Product Service

```typescript
// src/services/productService.ts

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  currency: "KRW" | "PHP";
  php_price?: number;
  images: Array<{
    url: string;
    alt?: string;
    is_primary?: boolean;
    order?: number;
  }>;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  product_type: "onhand" | "preorder" | "kr_website";
  status: "active" | "inactive" | "out_of_stock";
  stock: {
    available: number;
    reserved: number;
    total: number;
    min_threshold?: number;
    location?: string;
  };
  stores?: Array<{
    store_id: string;
    store_name: string;
    store_location: string;
    stock: number;
    available: boolean;
  }>;
  preorder?: {
    order_deadline: string;
    release_date: string;
    expected_delivery?: string;
    days_until_release: number;
    is_deadline_passed: boolean;
  };
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  variations?: ProductVariation[];
  created_at: string;
  updated_at: string;
}

export interface GetProductsParams {
  product_type?: "onhand" | "preorder" | "kr_website" | "all";
  status?: "active" | "inactive" | "out_of_stock";
  category?: string;
  brand?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: "price_asc" | "price_desc" | "name_asc" | "name_desc" | "created_desc" | "stock_desc";
  min_price?: number;
  max_price?: number;
  store_id?: string;
  include_out_of_stock?: boolean;
}

export interface GetProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
    filters_applied?: Record<string, any>;
    aggregations?: {
      total_products: number;
      price_range: { min: number; max: number };
      categories: Array<{ id: string; name: string; count: number }>;
      brands: Array<{ id: string; name: string; count: number }>;
    };
  };
}

export const productService = {
  /**
   * Get all products with unified filtering
   */
  async getProducts(params?: GetProductsParams): Promise<GetProductsResponse> {
    try {
      const response = await apiClient.get<GetProductsResponse>('/products', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single product by ID
   */
  async getProductById(id: string): Promise<Product> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Product }>(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get onhand products (convenience method)
   */
  async getOnhandProducts(params?: Omit<GetProductsParams, 'product_type'>): Promise<GetProductsResponse> {
    return this.getProducts({ ...params, product_type: 'onhand' });
  },

  /**
   * Get preorder products (convenience method)
   */
  async getPreorderProducts(params?: Omit<GetProductsParams, 'product_type'>): Promise<GetProductsResponse> {
    return this.getProducts({ ...params, product_type: 'preorder' });
  },

  /**
   * Get products by store/warehouse
   */
  async getProductsByStore(storeId: string, params?: Omit<GetProductsParams, 'store_id'>): Promise<GetProductsResponse> {
    return this.getProducts({ ...params, store_id: storeId });
  },
};
```

### 2. Optimized Product Display Component

Create a reusable `ProductCard` component:

```typescript
// src/components/store/ProductCard.tsx

interface ProductCardProps {
  product: Product;
  viewType?: "grid" | "list" | "single";
  showStoreInfo?: boolean;
}

export function ProductCard({ product, viewType = "grid", showStoreInfo = false }: ProductCardProps) {
  // Unified component for all product types
  // Handles onhand, preorder, and kr_website products
  // Shows store information if available
}
```

### 3. Server-Side Filtering with Pagination

```typescript
// app/(store)/store/products/page.tsx

const loadProducts = async (reset = false) => {
  if (!reset) setLoading(true);
  
  try {
    const params: GetProductsParams = {
      product_type: selectedType === "all" ? undefined : selectedType,
      category: selectedCategory === "all" ? undefined : selectedCategory,
      brand: selectedBrand === "all" ? undefined : selectedBrand,
      search: searchTerm || undefined,
      min_price: priceRange[0] || undefined,
      max_price: priceRange[1] || undefined,
      page: currentPage,
      limit: 20,
      sort: sortOption,
      include_out_of_stock: false,
    };
    
    const response = await productService.getProducts(params);
    
    if (reset) {
      setProducts(response.data.products);
    } else {
      setProducts(prev => [...prev, ...response.data.products]);
    }
    
    setPagination(response.data.pagination);
    setCategories(response.data.aggregations?.categories || []);
    setBrands(response.data.aggregations?.brands || []);
  } catch (error) {
    console.error("Error loading products:", error);
  } finally {
    setLoading(false);
  }
};
```

## Benefits of This Approach

1. **Reduced API Calls**: Single endpoint handles all product types
2. **Better Performance**: Server-side filtering and pagination
3. **Store Information**: Products include store/warehouse data
4. **Optimized Data Transfer**: Only requested data is sent
5. **Reusable Components**: Unified product display logic
6. **Better UX**: Faster loading, infinite scroll support
7. **Scalability**: Handles large product catalogs efficiently
8. **DataTable Ready**: Aggregated data perfect for admin DataTable

## Implementation Steps

1. **Backend**: Implement unified `/api/products` endpoint with all filters
2. **Frontend**: Update `productService.ts` with new types and methods
3. **Frontend**: Create reusable `ProductCard` component
4. **Frontend**: Update product pages to use unified service
5. **Frontend**: Implement pagination/infinite scroll
6. **Frontend**: Add store information display where needed
7. **Admin**: Update inventory DataTable to use aggregated data
8. **Testing**: Test all filter combinations and pagination

## API Call Examples

### Get All Onhand Products with Filters
```
GET /api/products?product_type=onhand&category=skincare&page=1&limit=20&sort=price_asc
```

### Get Preorder Products by Store
```
GET /api/products?product_type=preorder&store_id=store-1&page=1&limit=20
```

### Search Products Across All Types
```
GET /api/products?search=cosrx&page=1&limit=20
```

### Get Products for DataTable (Admin)
```
GET /api/products?page=1&limit=50&sort=created_desc&include_out_of_stock=true
```

