# Product API Specification - Onhand & Preorder Pages

## Required APIs

### 1. GET `/api/products/onhand`

**Purpose:** Get all onhand (in-stock) products

**Query Parameters:**
- `page` (optional): Page number (1-1000, default: 1)
- `limit` (optional): Items per page (1-100, default: 50)
- `category` (optional): Filter by category slug
- `brand` (optional): Filter by brand name
- `search` (optional): Search in name/description
- `min_price` (optional): Minimum price in KRW
- `max_price` (optional): Maximum price in KRW
- `in_stock` (optional): true/false - Filter by stock availability
- `sort` (optional): `price_asc` | `price_desc` | `name_asc` | `name_desc` | `created_desc` | `created_asc` | `stock_desc`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-uuid-1",
      "name": "Product Name",
      "description": "Product description",
      "price": 25000,
      "currency": "KRW",
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "category": "skincare",
      "brand": "Brand Name",
      "sku": "SKU-123",
      "stock": 50,
      "status": "active",
      "product_type": "onhand",
      "weight": 0.5,
      "dimensions": {
        "length": 20,
        "width": 15,
        "height": 10
      },
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Required Fields:**
- `id` - Product UUID
- `name` - Product name
- `price` - Price in KRW
- `currency` - "KRW"
- `images` - Array of image URLs (at least 1)
- `stock` - Available stock quantity
- `product_type` - Must be "onhand"

**Optional Fields:**
- `description` - Product description
- `category` - Category slug
- `brand` - Brand name
- `sku` - SKU code
- `status` - "active" | "inactive" | "out_of_stock"
- `weight` - Weight in kg
- `dimensions` - Object with length, width, height

---

### 2. GET `/api/products/preorder`

**Purpose:** Get all preorder products

**Query Parameters:**
- `page` (optional): Page number (1-1000, default: 1)
- `limit` (optional): Items per page (1-100, default: 50)
- `category` (optional): Filter by category slug
- `brand` (optional): Filter by brand name
- `search` (optional): Search in name/description
- `min_price` (optional): Minimum price in KRW
- `max_price` (optional): Maximum price in KRW
- `sort` (optional): `price_asc` | `price_desc` | `name_asc` | `name_desc` | `created_desc` | `created_asc` | `stock_desc`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-uuid-1",
      "name": "Preorder Product Name",
      "description": "Product description",
      "price": 50000,
      "currency": "KRW",
      "images": [
        "https://example.com/image1.jpg"
      ],
      "category": "skincare",
      "brand": "Brand Name",
      "sku": "SKU-123",
      "stock": 30,
      "status": "active",
      "product_type": "preorder",
      "order_date": "2024-12-15T00:00:00.000Z",
      "release_date": "2025-01-15T00:00:00.000Z",
      "weight": 0.5,
      "dimensions": {
        "length": 20,
        "width": 15,
        "height": 10
      },
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Required Fields:**
- `id` - Product UUID
- `name` - Product name
- `price` - Price in KRW
- `currency` - "KRW"
- `images` - Array of image URLs (at least 1)
- `stock` - Available stock quantity
- `product_type` - Must be "preorder"
- `order_date` - ISO date string (when preorder started)
- `release_date` - ISO date string (expected release date)

**Optional Fields:**
- `description` - Product description
- `category` - Category slug
- `brand` - Brand name
- `sku` - SKU code
- `status` - "active" | "inactive" | "out_of_stock"
- `weight` - Weight in kg
- `dimensions` - Object with length, width, height

---

## Frontend Usage

### Onhand Page
```typescript
// app/(store)/store/products/onhand/page.tsx
const response = await productService.getOnhandProducts();
setProducts(response.data); // Array of Product[]
```

### Preorder Page
```typescript
// app/(store)/store/products/preorder/page.tsx
const response = await productService.getPreorderProducts();
setProducts(response.data); // Array of Product[] with order_date and release_date
```

---

## Database Schema (Prisma)

```prisma
model Product {
  id            String   @id @default(uuid())
  name          String
  description   String?
  price         Decimal
  currency      String   @default("KRW")
  images        Json     // Array of strings
  category      String?
  brand         String?
  sku           String?
  stock         Int      @default(0)
  status        String   @default("active") // "active" | "inactive" | "out_of_stock"
  product_type  String   // "onhand" | "preorder" | "kr_website"
  order_date    DateTime? // For preorder products
  release_date  DateTime? // For preorder products
  weight        Decimal?
  dimensions    Json?    // { length, width, height }
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  @@map("products")
}
```

---

## Backend Implementation

### GET `/api/products/onhand`
```typescript
// Filter: product_type = 'onhand' AND status = 'active'
const products = await prisma.product.findMany({
  where: {
    product_type: 'onhand',
    status: 'active',
    ...(category && { category }),
  },
  orderBy: { created_at: 'desc' },
  skip: (page - 1) * limit,
  take: limit,
});
```

### GET `/api/products/preorder`
```typescript
// Filter: product_type = 'preorder' AND status = 'active'
const products = await prisma.product.findMany({
  where: {
    product_type: 'preorder',
    status: 'active',
    ...(category && { category }),
  },
  orderBy: { release_date: 'asc' }, // Order by release date
  skip: (page - 1) * limit,
  take: limit,
});
```

---

## Response Format Rules

1. **Always return array in `data` field**
2. **Include pagination if using pagination**
3. **Images must be array of URLs (strings)**
4. **Dates must be ISO 8601 format**
5. **Price must be number (not string)**
6. **Stock must be number (not string)**

