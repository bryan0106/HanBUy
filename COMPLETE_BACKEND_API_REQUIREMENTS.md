# Complete Backend API Requirements for HanBuy Express.js Backend

This document provides a comprehensive list of all API routes, database schemas, and backend requirements needed to connect the HanBuy frontend to an Express.js backend.

## Table of Contents
1. [Database Schema Requirements](#database-schema-requirements)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Routes by Category](#api-routes-by-category)
4. [Middleware Requirements](#middleware-requirements)
5. [Environment Variables](#environment-variables)
6. [Response Format Standards](#response-format-standards)
7. [Error Handling](#error-handling)

---

## Database Schema Requirements

### Core Tables Needed

#### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'solobox_client')),
  client_level VARCHAR(50) CHECK (client_level IN ('solobox', 'box_sharing', 'kr_to_kr', 'international')),
  approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  address JSONB, -- { street, city, province, zipCode, country }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  currency VARCHAR(10) DEFAULT 'KRW' CHECK (currency IN ('KRW', 'PHP')),
  images TEXT[], -- Array of image URLs
  category VARCHAR(100),
  brand VARCHAR(100),
  sku VARCHAR(100) UNIQUE,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  weight DECIMAL(10, 3), -- in kg
  length DECIMAL(10, 2),
  width DECIMAL(10, 2),
  height DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'onhand' CHECK (status IN ('onhand', 'preorder', 'out_of_stock')),
  seo_title VARCHAR(255),
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. Product Variations Table (Optional - for size/color variations)
```sql
CREATE TABLE product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- e.g., "Size: Large"
  type VARCHAR(50) CHECK (type IN ('size', 'color', 'other')),
  value VARCHAR(255) NOT NULL, -- e.g., "Large"
  price_modifier DECIMAL(10, 2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  sku VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Cart Items Table
```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  box_type_preference VARCHAR(50) DEFAULT 'solo' CHECK (box_type_preference IN ('solo', 'shared')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id, box_type_preference)
);
```

#### 5. Orders Table (See database/ORDERS_TABLE_SCHEMA.sql)
Already defined in `database/ORDERS_TABLE_SCHEMA.sql`

#### 6. Order Items Table (See database/ORDERS_TABLE_SCHEMA.sql)
Already defined in `database/ORDERS_TABLE_SCHEMA.sql`

#### 7. Boxes Table
```sql
CREATE TABLE boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  box_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'in_warehouse' CHECK (status IN (
    'in_warehouse', 'in_transit', 'in_customs', 'at_ph_hub', 
    'out_for_delivery', 'delivered', 'closed'
  )),
  current_location VARCHAR(255),
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  first_item_date TIMESTAMP WITH TIME ZONE,
  free_period_end TIMESTAMP WITH TIME ZONE,
  penalty_start_date TIMESTAMP WITH TIME ZONE,
  daily_penalty DECIMAL(10, 2) DEFAULT 50,
  current_penalty DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 8. Box Items Table
```sql
CREATE TABLE box_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) CHECK (currency IN ('KRW', 'PHP')),
  weight DECIMAL(10, 3),
  length DECIMAL(10, 2),
  width DECIMAL(10, 2),
  height DECIMAL(10, 2),
  image_url TEXT,
  sku VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 9. Invoices Table
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  box_id UUID REFERENCES boxes(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_fee DECIMAL(10, 2) DEFAULT 0,
  customs_fee DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'PHP' CHECK (currency IN ('PHP', 'KRW')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'unpaid', 'overdue')),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 10. Invoice Items Table
```sql
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 11. Tracking Events Table
```sql
CREATE TABLE tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number VARCHAR(100) NOT NULL,
  box_id UUID REFERENCES boxes(id) ON DELETE SET NULL,
  courier_id UUID REFERENCES couriers(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  description TEXT,
  translated_description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);
```

#### 12. Couriers Table
```sql
CREATE TABLE couriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  tracking_url_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 13. Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 14. Bank Types Table
```sql
CREATE TABLE bank_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 15. Box Types Table
```sql
CREATE TABLE box_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 16. Payment History Table
```sql
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  payment_type VARCHAR(50) NOT NULL,
  installment_number INTEGER,
  payment_method JSONB,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'refunded')),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  proof_of_payment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 17. Liked Items Table (Wishlist)
```sql
CREATE TABLE liked_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);
```

---

## Authentication & Authorization

### JWT Token Requirements
- Use `jsonwebtoken` package
- Token should include: `userId`, `email`, `role`
- Token expiration: 24 hours (or configurable)
- Store token in HTTP-only cookie or return in response body

### Middleware: `authenticateToken`
```javascript
// Verify JWT token from Authorization header
// Format: Authorization: Bearer {token}
```

### Middleware: `requireAdmin`
```javascript
// Check if user role is 'admin'
```

### Middleware: `requireApproved`
```javascript
// Check if user approval_status is 'approved' (except for admins)
```

---

## API Routes by Category

### 1. Authentication Routes

#### POST `/api/auth/login`
**Description:** User login with email and password
**Auth:** None (public)
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+63 912 345 6789",
    "role": "customer",
    "client_level": "solobox",
    "approval_status": "approved",
    "address": { ... }
  },
  "token": "jwt_token_here"
}
```
**Error Responses:**
- 401: Invalid email or password
- 403: Account not approved (non-admin users)
- 404: User not found

**Backend Requirements:**
- Verify password using `bcrypt.compare()`
- Check `approval_status` - reject if not 'approved' UNLESS role is 'admin'
- Return user data WITHOUT `password_hash`
- Generate JWT token

#### POST `/api/auth/logout`
**Description:** User logout
**Auth:** Required (Bearer token)
**Response:** 200 OK with success message

#### GET `/api/auth/me`
**Description:** Get current authenticated user
**Auth:** Required (Bearer token)
**Response:** Same as login response (user object)

#### POST `/api/auth/register`
**Description:** Register new user
**Auth:** None (public)
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+63XXXXXXXXXX"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "user": { ... },
  "message": "Registration successful. Please wait for admin approval."
}
```

---

### 2. User Management Routes

#### GET `/api/users`
**Description:** Get users with optional filters (Admin only)
**Auth:** Required (Admin)
**Query Parameters:**
- `role` (optional): Filter by role
- `approval_status` (optional): Filter by approval status
**Response:**
```json
{
  "users": [...],
  "total": 100
}
```

#### GET `/api/users/:id`
**Description:** Get specific user by ID
**Auth:** Required (Admin or own user)
**Response:** User object

#### PUT `/api/users/:id`
**Description:** Update user information
**Auth:** Required (Admin or own user)
**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "+63 912 345 6789",
  "address": { ... },
  "client_level": "solobox"
}
```
**Response:** Updated user object

---

### 3. Product Routes

#### GET `/api/products`
**Description:** Get all products
**Auth:** None (public)
**Query Parameters:**
- `category` (optional): Filter by category
- `status` (optional): `onhand` | `preorder` | `out_of_stock`
- `page` (optional): Page number
- `limit` (optional): Items per page
**Response:**
```json
{
  "products": [...],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### GET `/api/products/:id`
**Description:** Get single product by ID
**Auth:** None (public)
**Response:** Product object with variations

#### GET `/api/products/onhand`
**Description:** Get onhand items only
**Auth:** None (public)
**Query Parameters:** Same as `/api/products`

#### GET `/api/products/preorder`
**Description:** Get preorder items only
**Auth:** None (public)
**Query Parameters:** Same as `/api/products`

#### GET `/api/products/kr-comparison`
**Description:** Get price comparison data
**Auth:** None (public)
**Response:**
```json
{
  "items": [
    {
      "id": "comp-1",
      "itemId": "prod-1",
      "itemName": "Product Name",
      "ourPrice": 25000,
      "competitors": [...],
      "bestPrice": 25000,
      "savings": 3000
    }
  ]
}
```

---

### 4. Cart Routes

#### GET `/api/cart`
**Description:** Get cart items for a user
**Auth:** Required
**Query Parameters:**
- `user_id` (required): User UUID
**Response:**
```json
[
  {
    "id": "uuid",
    "product_id": "uuid",
    "product_name": "Product Name",
    "product_type": "onhand",
    "quantity": 2,
    "price": 25000,
    "image_url": "...",
    "box_type_preference": "solo",
    "product": { ... }
  }
]
```
**Implementation:** See `database/CART_API_IMPLEMENTATION.js`

#### POST `/api/cart`
**Description:** Add item to cart (upserts if exists)
**Auth:** Required
**Request Body:**
```json
{
  "user_id": "uuid",
  "product_id": "uuid",
  "quantity": 2,
  "box_type_preference": "solo",
  "variations": {
    "size": "Large",
    "color": "Red"
  },
  "selected_variation_ids": ["uuid1", "uuid2"]
}
```
**Response:** Cart item object
**Implementation:** See `database/CART_API_IMPLEMENTATION.js`

#### DELETE `/api/cart/:id`
**Description:** Remove item from cart
**Auth:** Required
**Response:** 200 OK

#### PUT `/api/cart/:id`
**Description:** Update cart item quantity
**Auth:** Required
**Request Body:**
```json
{
  "quantity": 3
}
```
**Response:** Updated cart item

---

### 5. Order Routes

#### GET `/api/orders`
**Description:** Get orders with optional filters
**Auth:** Required
**Query Parameters:**
- `user_id` (optional): Filter by user (users can only see their own)
- `status` (optional): Filter by status
- `payment_status` (optional): Filter by payment status
**Response:**
```json
{
  "success": true,
  "orders": [...],
  "total": 50
}
```
**Implementation:** See `database/ORDER_API_IMPLEMENTATION.js`

#### GET `/api/orders/:id`
**Description:** Get single order by ID
**Auth:** Required (own order or admin)
**Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "user_id": "uuid",
    "order_number": "HB-2024-001",
    "subtotal": 50000,
    "isf": 1000,
    "lsf": 500,
    "shipping_fee": 2000,
    "total": 53500,
    "currency": "PHP",
    "status": "pending",
    "payment_status": "pending",
    "payment_type": "full",
    "order_items": [...],
    ...
  }
}
```
**Implementation:** See `database/ORDER_API_IMPLEMENTATION.js`

#### POST `/api/orders`
**Description:** Create new order
**Auth:** Required
**Request Body:**
```json
{
  "user_id": "uuid",
  "order_number": "HB-2024-001",
  "subtotal": 50000,
  "isf": 1000,
  "lsf": 500,
  "shipping_fee": 2000,
  "solo_shipping_fee": 2000,
  "shared_shipping_fee": 1500,
  "total": 53500,
  "currency": "PHP",
  "status": "pending",
  "payment_status": "pending",
  "payment_type": "full",
  "payment_method": {
    "type": "qr_code",
    "bank": "GCASH"
  },
  "box_type_preference": "solo",
  "shipping_address": {
    "street": "123 Main St",
    "city": "Manila",
    "province": "Metro Manila",
    "zipCode": "1000",
    "country": "Philippines"
  },
  "order_items": [
    {
      "product_id": "uuid",
      "product_name": "Product Name",
      "product_type": "onhand",
      "quantity": 2,
      "unit_price": 25000,
      "total": 50000,
      "image_url": "..."
    }
  ]
}
```
**Response:** Created order object
**Implementation:** See `database/ORDER_API_IMPLEMENTATION.js`

#### PATCH `/api/orders/:id/status`
**Description:** Update order status (Admin only)
**Auth:** Required (Admin)
**Request Body:**
```json
{
  "status": "confirmed"
}
```
**Response:** Updated order

---

### 6. Payment Routes

#### POST `/api/payments/qr-code`
**Description:** Generate QR code for payment
**Auth:** Required
**Request Body:**
```json
{
  "orderId": "uuid",
  "amount": 3285,
  "bank": "GCASH"
}
```
**Response:**
```json
{
  "qrCode": "data:image/png;base64,...",
  "expiresAt": "2024-12-30T23:59:59Z",
  "paymentId": "uuid"
}
```

#### POST `/api/payments/confirm`
**Description:** Confirm payment with proof
**Auth:** Required
**Request Body:**
```json
{
  "paymentId": "uuid",
  "orderId": "uuid",
  "proofOfPayment": "file_url_or_base64"
}
```
**Response:** Payment confirmation

#### GET `/api/payments/:id`
**Description:** Get payment status
**Auth:** Required
**Response:** Payment object

---

### 7. Invoice Routes

#### GET `/api/invoices`
**Description:** Get user invoices
**Auth:** Required
**Query Parameters:**
- `status` (optional): `pending` | `paid` | `unpaid` | `overdue`
- `boxId` (optional): Filter by box
**Response:**
```json
{
  "invoices": [...],
  "total": 25
}
```

#### GET `/api/invoices/:id`
**Description:** Get single invoice
**Auth:** Required
**Response:** Invoice object with items

#### GET `/api/invoices/:id/pdf`
**Description:** Download invoice PDF
**Auth:** Required
**Response:** PDF file download

#### POST `/api/invoices`
**Description:** Create invoice (Admin only)
**Auth:** Required (Admin)
**Request Body:**
```json
{
  "user_id": "uuid",
  "box_id": "uuid",
  "items": [...],
  "subtotal": 5000,
  "shipping_fee": 500,
  "total": 5500
}
```
**Response:** Created invoice

#### PATCH `/api/invoices/:id/status`
**Description:** Update invoice status
**Auth:** Required (Admin)
**Request Body:**
```json
{
  "status": "paid"
}
```
**Response:** Updated invoice

---

### 8. Box Routes

#### GET `/api/boxes`
**Description:** Get user boxes
**Auth:** Required
**Response:**
```json
{
  "boxes": [
    {
      "id": "uuid",
      "boxNumber": "HB-2024-001",
      "status": "in_warehouse",
      "items": [...],
      "currentLocation": "Seoul Warehouse, Korea",
      "estimatedDelivery": "2024-12-25T..."
    }
  ]
}
```

#### GET `/api/boxes/:id`
**Description:** Get single box
**Auth:** Required
**Response:** Box object with items and tracking

#### POST `/api/boxes`
**Description:** Create new box
**Auth:** Required
**Request Body:**
```json
{
  "user_id": "uuid",
  "box_number": "HB-2024-001",
  "items": [...]
}
```
**Response:** Created box

#### PATCH `/api/boxes/:id/status`
**Description:** Update box status
**Auth:** Required (Admin)
**Request Body:**
```json
{
  "status": "in_transit"
}
```
**Response:** Updated box

#### GET `/api/boxes/:id/penalty`
**Description:** Get box penalty information
**Auth:** Required
**Response:**
```json
{
  "boxId": "uuid",
  "boxNumber": "HB-2024-001",
  "firstItemDate": "2024-10-01T...",
  "freePeriodEnd": "2024-12-01T...",
  "penaltyStartDate": "2024-12-02T...",
  "daysOverFree": 10,
  "dailyPenalty": 50,
  "currentPenalty": 500,
  "daysRemaining": 20
}
```

---

### 9. Tracking Routes

#### GET `/api/tracking/:trackingNumber`
**Description:** Get tracking information by tracking number
**Auth:** Optional (public for basic info, authenticated for detailed)
**Query Parameters:**
- `courier` (optional): Courier code
**Response:**
```json
{
  "trackingNumber": "HB-2024-001",
  "courier": {
    "id": "uuid",
    "name": "Korea Post",
    "code": "KR_POST"
  },
  "status": "in_transit",
  "currentLocation": "Incheon Airport, Korea",
  "events": [
    {
      "timestamp": "2024-12-01T10:00:00Z",
      "location": "Seoul Warehouse",
      "status": "in_warehouse",
      "description": "Package received",
      "translatedDescription": "Package received at warehouse"
    }
  ],
  "estimatedDelivery": "2024-12-15T..."
}
```

#### POST `/api/tracking/incoming`
**Description:** Add incoming package tracking
**Auth:** Required
**Request Body:**
```json
{
  "trackingNumber": "KR123456789",
  "courier": "KR_POST",
  "description": "Package description"
}
```
**Response:** Tracking event

#### GET `/api/tracking/outgoing`
**Description:** Get outgoing packages
**Auth:** Required
**Response:** Array of tracking events

---

### 10. Shipping Routes

#### POST `/api/shipping/quote`
**Description:** Calculate shipping quote
**Auth:** Optional
**Request Body:**
```json
{
  "origin": "Korea",
  "destination": {
    "city": "Manila",
    "province": "Metro Manila",
    "zipCode": "1000",
    "country": "Philippines"
  },
  "items": [
    {
      "name": "Item 1",
      "quantity": 2,
      "weight": 0.5,
      "length": 20,
      "width": 15,
      "height": 10,
      "value": 1000
    }
  ],
  "shippingMethod": "sea"
}
```
**Response:**
```json
{
  "quoteId": "uuid",
  "shippingMethod": "sea",
  "estimatedDays": 14,
  "baseCost": 5000,
  "fuelSurcharge": 500,
  "customsFee": 200,
  "insuranceFee": 100,
  "totalCost": 5800,
  "currency": "PHP",
  "validUntil": "2024-12-31T23:59:59Z"
}
```

#### POST `/api/shipping/cbm-calculate`
**Description:** Calculate CBM (Cubic Meter)
**Auth:** Optional
**Request Body:**
```json
{
  "items": [
    {
      "length": 20,
      "width": 15,
      "height": 10,
      "quantity": 2
    }
  ]
}
```
**Response:**
```json
{
  "totalCBM": 0.006,
  "totalWeight": 1.2,
  "estimates": {
    "sea": 5000,
    "air": 15000
  }
}
```

---

### 11. Document Routes

#### POST `/api/documents/upload`
**Description:** Upload document
**Auth:** Required
**Request:** Multipart form data
- `file`: File
- `type`: `proof_of_payment` | `id` | `other`
- `orderId` (optional): Related order ID
- `invoiceId` (optional): Related invoice ID
**Response:**
```json
{
  "id": "uuid",
  "fileName": "proof.jpg",
  "fileUrl": "https://cdn.hanbuy.com/documents/doc-1.jpg",
  "type": "proof_of_payment",
  "uploadedAt": "2024-12-30T..."
}
```

#### GET `/api/documents`
**Description:** Get user documents
**Auth:** Required
**Query Parameters:**
- `type` (optional): Filter by type
**Response:** Array of documents

#### GET `/api/documents/:id`
**Description:** Get single document
**Auth:** Required
**Response:** Document object

#### DELETE `/api/documents/:id`
**Description:** Delete document
**Auth:** Required
**Response:** 200 OK

---

### 12. Notification Routes

#### GET `/api/notifications`
**Description:** Get user notifications
**Auth:** Required
**Query Parameters:**
- `read` (optional): `true` | `false`
- `type` (optional): Filter by type
**Response:**
```json
{
  "notifications": [...],
  "unreadCount": 5
}
```

#### PATCH `/api/notifications/:id/read`
**Description:** Mark notification as read
**Auth:** Required
**Response:** Updated notification

#### GET `/api/notifications/preferences`
**Description:** Get notification preferences
**Auth:** Required
**Response:** Preferences object

#### PATCH `/api/notifications/preferences`
**Description:** Update notification preferences
**Auth:** Required
**Request Body:**
```json
{
  "email": true,
  "sms": false,
  "facebook_messenger": true
}
```
**Response:** Updated preferences

---

### 13. Liked Items (Wishlist) Routes

#### GET `/api/liked`
**Description:** Get user's liked items
**Auth:** Required
**Response:** Array of product IDs or full product objects

#### POST `/api/liked`
**Description:** Add item to liked list
**Auth:** Required
**Request Body:**
```json
{
  "product_id": "uuid"
}
```
**Response:** Liked item object

#### DELETE `/api/liked/:productId`
**Description:** Remove item from liked list
**Auth:** Required
**Response:** 200 OK

---

### 14. Admin Routes

#### GET `/api/admin/dashboard/stats`
**Description:** Get admin dashboard statistics
**Auth:** Required (Admin)
**Response:**
```json
{
  "totalOrders": 156,
  "pendingOrders": 12,
  "totalInventory": 1245,
  "lowStockItems": 8,
  "pendingInvoices": 23,
  "unpaidInvoices": 15,
  "activeBoxes": 89,
  "pendingApprovals": 5
}
```

#### Inventory Management

##### GET `/api/admin/inventory`
**Description:** Get all inventory items
**Auth:** Required (Admin)
**Query Parameters:**
- `status` (optional): `onhand` | `preorder` | `out_of_stock`
- `alert` (optional): `low_stock` | `out_of_stock`
**Response:** Array of products

##### POST `/api/admin/inventory`
**Description:** Create inventory item
**Auth:** Required (Admin)
**Request Body:** Product object
**Response:** Created product

##### PATCH `/api/admin/inventory/:id`
**Description:** Update inventory item
**Auth:** Required (Admin)
**Request Body:** Partial product object
**Response:** Updated product

##### DELETE `/api/admin/inventory/:id`
**Description:** Delete inventory item
**Auth:** Required (Admin)
**Response:** 200 OK

##### GET `/api/admin/inventory/alerts`
**Description:** Get stock alerts
**Auth:** Required (Admin)
**Response:** Array of low stock items

#### Order Management

##### GET `/api/admin/orders`
**Description:** Get all orders (Admin view)
**Auth:** Required (Admin)
**Query Parameters:**
- `status` (optional)
- `payment_status` (optional)
- `user_id` (optional)
**Response:** Array of orders

##### GET `/api/admin/orders/:id`
**Description:** Get single order (Admin view)
**Auth:** Required (Admin)
**Response:** Order object

##### PATCH `/api/admin/orders/:id/status`
**Description:** Update order status
**Auth:** Required (Admin)
**Request Body:**
```json
{
  "status": "confirmed"
}
```
**Response:** Updated order

#### Invoice Management

##### GET `/api/admin/invoices`
**Description:** Get all invoices
**Auth:** Required (Admin)
**Response:** Array of invoices

##### POST `/api/admin/invoices/auto-generate`
**Description:** Auto-generate invoices
**Auth:** Required (Admin)
**Response:** Generated invoices

##### POST `/api/admin/invoices/:id/send-reminder`
**Description:** Send payment reminder
**Auth:** Required (Admin)
**Response:** 200 OK

#### Box Management

##### GET `/api/admin/boxes`
**Description:** Get all boxes
**Auth:** Required (Admin)
**Query Parameters:**
- `status` (optional)
- `clientId` (optional)
**Response:** Array of boxes

##### GET `/api/admin/boxes/closed`
**Description:** Get closed boxes list
**Auth:** Required (Admin)
**Response:** Array of closed boxes

##### POST `/api/admin/boxes/:id/close`
**Description:** Close box
**Auth:** Required (Admin)
**Response:** Updated box

##### GET `/api/admin/boxes/penalties`
**Description:** Get boxes with penalties
**Auth:** Required (Admin)
**Response:** Array of boxes with penalty info

##### POST `/api/admin/boxes/:id/calculate-penalty`
**Description:** Calculate box penalty
**Auth:** Required (Admin)
**Response:** Penalty calculation

#### Client Management

##### GET `/api/admin/clients`
**Description:** Get all clients
**Auth:** Required (Admin)
**Query Parameters:**
- `status` (optional): `pending` | `approved` | `rejected`
- `level` (optional): Filter by client level
**Response:** Array of users

##### GET `/api/admin/clients/:id`
**Description:** Get single client
**Auth:** Required (Admin)
**Response:** User object

##### POST `/api/admin/clients/:id/approve`
**Description:** Approve client
**Auth:** Required (Admin)
**Request Body:**
```json
{
  "level": "solobox"
}
```
**Response:** Updated user

##### POST `/api/admin/clients/:id/reject`
**Description:** Reject client
**Auth:** Required (Admin)
**Response:** Updated user

#### Social Media

##### GET `/api/admin/social/posts`
**Description:** Get social media posts
**Auth:** Required (Admin)
**Response:** Array of posts

##### POST `/api/admin/social/posts`
**Description:** Create social media post
**Auth:** Required (Admin)
**Request Body:**
```json
{
  "itemId": "uuid",
  "platform": "facebook",
  "content": "Post content...",
  "images": [...],
  "scheduledDate": "2024-12-31T12:00:00Z"
}
```
**Response:** Created post

##### POST `/api/admin/social/posts/:id/publish`
**Description:** Publish post
**Auth:** Required (Admin)
**Response:** Published post

#### Notifications

##### GET `/api/admin/notifications`
**Description:** Get notifications (Admin view)
**Auth:** Required (Admin)
**Response:** Array of notifications

##### POST `/api/admin/notifications/send`
**Description:** Send notification
**Auth:** Required (Admin)
**Request Body:**
```json
{
  "userId": "uuid",
  "type": "invoice_created",
  "channels": ["email", "sms", "facebook_messenger"],
  "title": "New Invoice",
  "message": "You have a new invoice..."
}
```
**Response:** Sent notification

---

### 15. KR Website Integration Routes

#### GET `/api/kr-websites/compare/:itemId`
**Description:** Get price comparison for item
**Auth:** Optional
**Response:**
```json
{
  "itemId": "uuid",
  "ourPrice": 25000,
  "competitors": [...],
  "bestPrice": 25000,
  "lastUpdated": "2024-12-30T..."
}
```

#### POST `/api/kr-websites/crawl`
**Description:** Crawl KR website data (Admin only)
**Auth:** Required (Admin)
**Request Body:**
```json
{
  "url": "https://gmarket.co.kr/product/...",
  "website": "Gmarket"
}
```
**Response:** Crawled product data

#### GET `/api/kr-websites/sale-alerts`
**Description:** Get sale alerts
**Auth:** Optional
**Response:** Array of sale alerts

---

### 16. Utility Routes

#### GET `/api/bank-type`
**Description:** Get all bank types
**Auth:** None (public)
**Response:**
```json
[
  {
    "code": "GCASH",
    "name": "GCash",
    "color": "#0070f3"
  }
]
```

#### GET `/api/box-type`
**Description:** Get all box types
**Auth:** None (public)
**Response:**
```json
[
  {
    "code": "solo",
    "name": "Solo Box",
    "description": "...",
    "color": "#FF85A2"
  }
]
```

#### GET `/api/health`
**Description:** Health check endpoint
**Auth:** None (public)
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-30T..."
}
```

---

## Middleware Requirements

### 1. CORS Middleware
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### 2. Body Parser
```javascript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

### 3. Authentication Middleware
```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};
```

### 4. Admin Check Middleware
```javascript
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
```

### 5. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Environment Variables

Create a `.env` file in your backend root:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hanbuy
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hanbuy
DB_USER=your_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Frontend
FRONTEND_URL=http://localhost:3000

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# SMS (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# Facebook Messenger (optional)
FB_PAGE_ACCESS_TOKEN=your_fb_token
```

---

## Response Format Standards

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error code or message",
  "message": "Human-readable error message",
  "details": { ... } // Optional, only in development
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (validation failed)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": {
    "field": "validation error message"
  }
}
```

---

## Package Dependencies

### Required npm packages:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "postgres": "^3.4.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1",
    "express-rate-limit": "^7.1.0",
    "helmet": "^7.1.0",
    "express-validator": "^7.0.1",
    "qrcode": "^1.5.3",
    "pdfkit": "^0.14.0",
    "nodemailer": "^6.9.7",
    "cheerio": "^1.0.0-rc.12",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "@types/qrcode": "^1.5.5"
  }
}
```

---

## Database Connection Setup

### Using `postgres` package (recommended):
```javascript
const postgres = require('postgres');

const sql = postgres({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false
});
```

---

## Implementation Priority

### Phase 1 (Critical - Must Have)
1. ✅ Authentication (login, register, me)
2. ✅ Products (list, get by id)
3. ✅ Cart (get, add, update, delete)
4. ✅ Orders (create, get, list)
5. ✅ Users (get, update)

### Phase 2 (Important)
6. Boxes (get, create, update)
7. Invoices (get, create, download PDF)
8. Tracking (search, add incoming)
9. Payments (QR code generation, confirm)
10. Notifications (get, mark as read)

### Phase 3 (Nice to Have)
11. Admin dashboard stats
12. Admin inventory management
13. Admin order management
14. Admin client management
15. Shipping calculator
16. CBM calculator
17. Penalty calculator
18. Document upload
19. Liked items (wishlist)
20. KR website integration

---

## Notes

1. **UUID Format**: All IDs should be UUIDs (v4)
2. **Date Format**: Use ISO 8601 format (UTC) for all timestamps
3. **Currency**: Support both PHP and KRW
4. **File Uploads**: Use multipart/form-data for file uploads
5. **Pagination**: Use `page` and `limit` query parameters
6. **Filtering**: Use query parameters for filtering
7. **Sorting**: Use `sort` and `order` query parameters
8. **Search**: Use `q` or `search` query parameter for text search
9. **CORS**: Configure CORS to allow frontend domain
10. **Rate Limiting**: Implement rate limiting for all endpoints
11. **Input Validation**: Validate all inputs using express-validator
12. **Error Logging**: Log all errors for debugging
13. **Password Hashing**: Always use bcrypt for password hashing
14. **JWT Tokens**: Include user role and ID in JWT payload
15. **Database Transactions**: Use transactions for multi-step operations (e.g., order creation)

---

## Testing

### Test Endpoints:
- Use Postman or similar tool to test all endpoints
- Test with valid and invalid data
- Test authentication and authorization
- Test error cases
- Test pagination and filtering

### Test Data:
- Create test users with different roles
- Create test products
- Create test orders
- Test with empty data sets

---

This document should serve as a complete reference for implementing the Express.js backend for the HanBuy platform. All routes listed here are required for the frontend to function properly.

