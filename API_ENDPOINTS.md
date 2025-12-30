# HanBuy Backend API Endpoints

This document outlines all the backend API endpoints that need to be implemented to connect with the frontend.

## Base URL
```
Production: https://api.hanbuy.com
Development: http://localhost:3001/api
```

---

## Authentication Endpoints

### POST `/api/auth/login`
**Description:** User login
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "user": {
    "id": "user-1",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer" | "admin" | "solobox_client",
    "clientLevel": "solobox" | "box_sharing" | "kr_to_kr" | "international",
    "approvalStatus": "pending" | "approved" | "rejected"
  },
  "token": "jwt_token_here"
}
```

### POST `/api/auth/logout`
**Description:** User logout
**Headers:** `Authorization: Bearer {token}`

### GET `/api/auth/me`
**Description:** Get current user
**Headers:** `Authorization: Bearer {token}`

### POST `/api/auth/register`
**Description:** Register new user
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+63XXXXXXXXXX"
}
```

---

## Product Endpoints

### GET `/api/products`
**Description:** Get all products
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

### GET `/api/products/:id`
**Description:** Get single product
**Response:**
```json
{
  "id": "prod-1",
  "name": "Product Name",
  "description": "...",
  "price": 25000,
  "currency": "KRW",
  "stock": 50,
  "status": "onhand" | "preorder",
  "images": [...],
  ...
}
```

### GET `/api/products/onhand`
**Description:** Get onhand items only
**Query Parameters:** Same as `/api/products`

### GET `/api/products/preorder`
**Description:** Get preorder items only
**Query Parameters:** Same as `/api/products`

### GET `/api/products/kr-comparison`
**Description:** Get price comparison data
**Response:**
```json
{
  "items": [
    {
      "id": "comp-1",
      "itemId": "prod-1",
      "itemName": "Product Name",
      "ourPrice": 25000,
      "competitors": [
        {
          "website": "Gmarket",
          "url": "https://...",
          "price": 28000,
          "currency": "KRW",
          "lastChecked": "2024-12-30T..."
        }
      ],
      "bestPrice": 25000,
      "savings": 3000
    }
  ]
}
```

---

## Order Endpoints

### GET `/api/orders`
**Description:** Get user orders
**Headers:** `Authorization: Bearer {token}`
**Query Parameters:**
- `status` (optional): Filter by status
- `page`, `limit` (optional): Pagination

**Response:**
```json
{
  "orders": [...],
  "total": 50
}
```

### GET `/api/orders/:id`
**Description:** Get single order
**Headers:** `Authorization: Bearer {token}`

### POST `/api/orders`
**Description:** Create new order
**Headers:** `Authorization: Bearer {token}`
**Request Body:**
```json
{
  "items": [
    {
      "productId": "prod-1",
      "quantity": 2,
      "productType": "onhand" | "preorder" | "kr_website"
    }
  ],
  "shippingAddress": {
    "street": "...",
    "city": "...",
    "province": "...",
    "zipCode": "...",
    "country": "Philippines"
  }
}
```

### PATCH `/api/orders/:id/status`
**Description:** Update order status (Admin only)
**Headers:** `Authorization: Bearer {token}`
**Request Body:**
```json
{
  "status": "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
}
```

---

## Payment Endpoints

### POST `/api/payments/qr-code`
**Description:** Generate QR code for payment
**Headers:** `Authorization: Bearer {token}`
**Request Body:**
```json
{
  "orderId": "order-1",
  "amount": 3285,
  "bank": "GCASH" | "BPI" | "BDO" | "GOTYME" | "MAYA"
}
```
**Response:**
```json
{
  "qrCode": "data:image/png;base64,...",
  "expiresAt": "2024-12-30T23:59:59Z",
  "paymentId": "pay-1"
}
```

### POST `/api/payments/confirm`
**Description:** Confirm payment
**Headers:** `Authorization: Bearer {token}`
**Request Body:**
```json
{
  "paymentId": "pay-1",
  "orderId": "order-1",
  "proofOfPayment": "file_url_or_base64"
}
```

### GET `/api/payments/:id`
**Description:** Get payment status
**Headers:** `Authorization: Bearer {token}`

---

## Invoice Endpoints

### GET `/api/invoices`
**Description:** Get user invoices
**Headers:** `Authorization: Bearer {token}`
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

### GET `/api/invoices/:id`
**Description:** Get single invoice
**Headers:** `Authorization: Bearer {token}`

### GET `/api/invoices/:id/pdf`
**Description:** Download invoice PDF
**Headers:** `Authorization: Bearer {token}`
**Response:** PDF file download

### POST `/api/invoices`
**Description:** Create invoice (Admin only)
**Headers:** `Authorization: Bearer {token}`

### PATCH `/api/invoices/:id/status`
**Description:** Update invoice status
**Headers:** `Authorization: Bearer {token}`

---

## Box Endpoints

### GET `/api/boxes`
**Description:** Get user boxes
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "boxes": [
    {
      "id": "box-1",
      "boxNumber": "HB-2024-001",
      "status": "in_warehouse",
      "items": [...],
      "currentLocation": "Seoul Warehouse, Korea",
      "estimatedDelivery": "2024-12-25T..."
    }
  ]
}
```

### GET `/api/boxes/:id`
**Description:** Get single box
**Headers:** `Authorization: Bearer {token}`

### POST `/api/boxes`
**Description:** Create new box
**Headers:** `Authorization: Bearer {token}`

### PATCH `/api/boxes/:id/status`
**Description:** Update box status
**Headers:** `Authorization: Bearer {token}`

### GET `/api/boxes/:id/penalty`
**Description:** Get box penalty information
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "boxId": "box-1",
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

## Tracking Endpoints

### GET `/api/tracking/:trackingNumber`
**Description:** Get tracking information by tracking number
**Query Parameters:**
- `courier` (optional): Courier code

**Response:**
```json
{
  "trackingNumber": "HB-2024-001",
  "courier": {
    "id": "courier-1",
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

### POST `/api/tracking/incoming`
**Description:** Add incoming package tracking
**Headers:** `Authorization: Bearer {token}`
**Request Body:**
```json
{
  "trackingNumber": "KR123456789",
  "courier": "KR_POST",
  "description": "Package description"
}
```

### GET `/api/tracking/outgoing`
**Description:** Get outgoing packages
**Headers:** `Authorization: Bearer {token}`

---

## Shipping Endpoints

### POST `/api/shipping/quote`
**Description:** Calculate shipping quote
**Headers:** `Authorization: Bearer {token}` (optional for public)
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
  "shippingMethod": "sea" | "air" | "express"
}
```
**Response:**
```json
{
  "quoteId": "quote-1",
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

### POST `/api/shipping/cbm-calculate`
**Description:** Calculate CBM
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

## Document Endpoints

### POST `/api/documents/upload`
**Description:** Upload document
**Headers:** `Authorization: Bearer {token}`
**Request:** Multipart form data
- `file`: File
- `type`: `proof_of_payment` | `id` | `other`
- `orderId` (optional): Related order ID
- `invoiceId` (optional): Related invoice ID

**Response:**
```json
{
  "id": "doc-1",
  "fileName": "proof.jpg",
  "fileUrl": "https://cdn.hanbuy.com/documents/doc-1.jpg",
  "type": "proof_of_payment",
  "uploadedAt": "2024-12-30T..."
}
```

### GET `/api/documents`
**Description:** Get user documents
**Headers:** `Authorization: Bearer {token}`
**Query Parameters:**
- `type` (optional): Filter by type

### GET `/api/documents/:id`
**Description:** Get single document
**Headers:** `Authorization: Bearer {token}`

### DELETE `/api/documents/:id`
**Description:** Delete document
**Headers:** `Authorization: Bearer {token}`

---

## Admin Endpoints

### GET `/api/admin/dashboard/stats`
**Description:** Get admin dashboard statistics
**Headers:** `Authorization: Bearer {token}` (Admin only)
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

### Inventory Management

#### GET `/api/admin/inventory`
**Description:** Get all inventory items
**Headers:** `Authorization: Bearer {token}` (Admin only)
**Query Parameters:**
- `status` (optional): `onhand` | `preorder` | `out_of_stock`
- `alert` (optional): `low_stock` | `out_of_stock`

#### POST `/api/admin/inventory`
**Description:** Create inventory item
**Headers:** `Authorization: Bearer {token}` (Admin only)

#### PATCH `/api/admin/inventory/:id`
**Description:** Update inventory item
**Headers:** `Authorization: Bearer {token}` (Admin only)

#### DELETE `/api/admin/inventory/:id`
**Description:** Delete inventory item
**Headers:** `Authorization: Bearer {token}` (Admin only)

#### GET `/api/admin/inventory/alerts`
**Description:** Get stock alerts
**Headers:** `Authorization: Bearer {token}` (Admin only)

### Order Management

#### GET `/api/admin/orders`
**Description:** Get all orders
**Headers:** `Authorization: Bearer {token}` (Admin only)

#### GET `/api/admin/orders/:id`
**Description:** Get single order
**Headers:** `Authorization: Bearer {token}` (Admin only)

#### PATCH `/api/admin/orders/:id/status`
**Description:** Update order status
**Headers:** `Authorization: Bearer {token}` (Admin only)

### Invoice Management

#### GET `/api/admin/invoices`
**Description:** Get all invoices
**Headers:** `Authorization: Bearer {token}` (Admin only)

#### POST `/api/admin/invoices/auto-generate`
**Description:** Auto-generate invoices
**Headers:** `Authorization: Bearer {token}` (Admin only)

#### POST `/api/admin/invoices/:id/send-reminder`
**Description:** Send payment reminder
**Headers:** `Authorization: Bearer {token}` (Admin only)

### Box Management

#### GET `/api/admin/boxes`
**Description:** Get all boxes
**Headers:** `Authorization: Bearer {token}` (Admin only)
**Query Parameters:**
- `status` (optional): Filter by status
- `clientId` (optional): Filter by client

#### GET `/api/admin/boxes/closed`
**Description:** Get closed boxes list
**Headers:** `Authorization: Bearer {token}` (Admin only)

#### POST `/api/admin/boxes/:id/close`
**Description:** Close box
**Headers:** `Authorization: Bearer {token}` (Admin only)

#### GET `/api/admin/boxes/penalties`
**Description:** Get boxes with penalties
**Headers:** `Authorization: Bearer {token}` (Admin only)

#### POST `/api/admin/boxes/:id/calculate-penalty`
**Description:** Calculate box penalty
**Headers:** `Authorization: Bearer {token}` (Admin only)

### Client Management

#### GET `/api/admin/clients`
**Description:** Get all clients
**Headers:** `Authorization: Bearer {token}` (Admin only)
**Query Parameters:**
- `status` (optional): `pending` | `approved` | `rejected`
- `level` (optional): Filter by client level

#### GET `/api/admin/clients/:id`
**Description:** Get single client
**Headers:** `Authorization: Bearer {token}` (Admin only)

#### POST `/api/admin/clients/:id/approve`
**Description:** Approve client
**Headers:** `Authorization: Bearer {token}` (Admin only)
**Request Body:**
```json
{
  "level": "solobox" | "box_sharing" | "kr_to_kr" | "international"
}
```

#### POST `/api/admin/clients/:id/reject`
**Description:** Reject client
**Headers:** `Authorization: Bearer {token}` (Admin only)

### Social Media

#### GET `/api/admin/social/posts`
**Description:** Get social media posts
**Headers:** `Authorization: Bearer {token}` (Admin only)

#### POST `/api/admin/social/posts`
**Description:** Create social media post
**Headers:** `Authorization: Bearer {token}` (Admin only)
**Request Body:**
```json
{
  "itemId": "prod-1",
  "platform": "facebook" | "instagram" | "twitter",
  "content": "Post content...",
  "images": [...],
  "scheduledDate": "2024-12-31T12:00:00Z"
}
```

#### POST `/api/admin/social/posts/:id/publish`
**Description:** Publish post
**Headers:** `Authorization: Bearer {token}` (Admin only)

### Notifications

#### GET `/api/admin/notifications`
**Description:** Get notifications
**Headers:** `Authorization: Bearer {token}` (Admin only)

#### POST `/api/admin/notifications/send`
**Description:** Send notification
**Headers:** `Authorization: Bearer {token}` (Admin only)
**Request Body:**
```json
{
  "userId": "user-1",
  "type": "invoice_created",
  "channels": ["email", "sms", "facebook_messenger"],
  "title": "New Invoice",
  "message": "You have a new invoice..."
}
```

---

## Notification Endpoints

### GET `/api/notifications`
**Description:** Get user notifications
**Headers:** `Authorization: Bearer {token}`
**Query Parameters:**
- `read` (optional): `true` | `false`
- `type` (optional): Filter by type

### PATCH `/api/notifications/:id/read`
**Description:** Mark notification as read
**Headers:** `Authorization: Bearer {token}`

### GET `/api/notifications/preferences`
**Description:** Get notification preferences
**Headers:** `Authorization: Bearer {token}`

### PATCH `/api/notifications/preferences`
**Description:** Update notification preferences
**Headers:** `Authorization: Bearer {token}`

---

## KR Website Integration Endpoints

### GET `/api/kr-websites/compare/:itemId`
**Description:** Get price comparison for item
**Response:**
```json
{
  "itemId": "prod-1",
  "ourPrice": 25000,
  "competitors": [...],
  "bestPrice": 25000,
  "lastUpdated": "2024-12-30T..."
}
```

### POST `/api/kr-websites/crawl`
**Description:** Crawl KR website data (Admin only)
**Headers:** `Authorization: Bearer {token}` (Admin only)
**Request Body:**
```json
{
  "url": "https://gmarket.co.kr/product/...",
  "website": "Gmarket"
}
```

### GET `/api/kr-websites/sale-alerts`
**Description:** Get sale alerts
**Headers:** `Authorization: Bearer {token}` (optional)

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (Admin only)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer {jwt_token}
```

Tokens should be obtained from `/api/auth/login` and stored securely.

---

## Rate Limiting

- Public endpoints: 100 requests/minute
- Authenticated endpoints: 1000 requests/minute
- Admin endpoints: 5000 requests/minute

---

## Webhooks (Future)

### Payment Webhooks
- `POST /webhooks/payment/confirmed` - Payment confirmed
- `POST /webhooks/payment/failed` - Payment failed

### Courier Webhooks
- `POST /webhooks/tracking/update` - Tracking update from courier

---

## Notes

1. All dates should be in ISO 8601 format (UTC)
2. All monetary values should include currency code
3. File uploads should use multipart/form-data
4. Pagination uses `page` and `limit` query parameters
5. All admin endpoints require admin role verification
6. CORS should be configured for frontend domain
7. Rate limiting should be implemented
8. Input validation required for all endpoints

