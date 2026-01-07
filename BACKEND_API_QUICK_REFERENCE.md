# Backend API Quick Reference

## Summary of All Required API Routes

### Base URL
```
Development: http://localhost:3001/api
Production: https://api.hanbuy.com/api
```

---

## 🔐 Authentication (4 routes)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - Register new user

---

## 👥 Users (3 routes)
- `GET /api/users` - Get users (Admin only, with filters)
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user

---

## 📦 Products (5 routes)
- `GET /api/products` - Get all products (with filters: category, status, page, limit)
- `GET /api/products/:id` - Get single product
- `GET /api/products/onhand` - Get onhand items only
- `GET /api/products/preorder` - Get preorder items only
- `GET /api/products/kr-comparison` - Get price comparison data

---

## 🛒 Cart (4 routes)
- `GET /api/cart?user_id=uuid` - Get cart items
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/:id` - Remove item from cart
- `PUT /api/cart/:id` - Update cart item quantity

---

## 📋 Orders (4 routes)
- `GET /api/orders` - Get orders (with filters: user_id, status, payment_status)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status (Admin only)

---

## 💳 Payments (3 routes)
- `POST /api/payments/qr-code` - Generate QR code for payment
- `POST /api/payments/confirm` - Confirm payment with proof
- `GET /api/payments/:id` - Get payment status

---

## 🧾 Invoices (5 routes)
- `GET /api/invoices` - Get user invoices (with filters: status, boxId)
- `GET /api/invoices/:id` - Get single invoice
- `GET /api/invoices/:id/pdf` - Download invoice PDF
- `POST /api/invoices` - Create invoice (Admin only)
- `PATCH /api/invoices/:id/status` - Update invoice status

---

## 📦 Boxes (5 routes)
- `GET /api/boxes` - Get user boxes
- `GET /api/boxes/:id` - Get single box
- `POST /api/boxes` - Create new box
- `PATCH /api/boxes/:id/status` - Update box status (Admin)
- `GET /api/boxes/:id/penalty` - Get box penalty information

---

## 🚚 Tracking (3 routes)
- `GET /api/tracking/:trackingNumber` - Get tracking info by tracking number
- `POST /api/tracking/incoming` - Add incoming package tracking
- `GET /api/tracking/outgoing` - Get outgoing packages

---

## 📮 Shipping (2 routes)
- `POST /api/shipping/quote` - Calculate shipping quote
- `POST /api/shipping/cbm-calculate` - Calculate CBM

---

## 📄 Documents (4 routes)
- `POST /api/documents/upload` - Upload document (multipart/form-data)
- `GET /api/documents` - Get user documents (with filter: type)
- `GET /api/documents/:id` - Get single document
- `DELETE /api/documents/:id` - Delete document

---

## 🔔 Notifications (4 routes)
- `GET /api/notifications` - Get user notifications (with filters: read, type)
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `GET /api/notifications/preferences` - Get notification preferences
- `PATCH /api/notifications/preferences` - Update notification preferences

---

## ❤️ Liked Items / Wishlist (3 routes)
- `GET /api/liked` - Get user's liked items
- `POST /api/liked` - Add item to liked list
- `DELETE /api/liked/:productId` - Remove item from liked list

---

## 🔧 Utility Routes (3 routes)
- `GET /api/bank-type` - Get all bank types
- `GET /api/box-type` - Get all box types
- `GET /api/health` - Health check

---

## 👨‍💼 Admin Routes (25+ routes)

### Dashboard
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

### Inventory Management (5 routes)
- `GET /api/admin/inventory` - Get all inventory items
- `POST /api/admin/inventory` - Create inventory item
- `PATCH /api/admin/inventory/:id` - Update inventory item
- `DELETE /api/admin/inventory/:id` - Delete inventory item
- `GET /api/admin/inventory/alerts` - Get stock alerts

### Order Management (3 routes)
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:id` - Get single order
- `PATCH /api/admin/orders/:id/status` - Update order status

### Invoice Management (3 routes)
- `GET /api/admin/invoices` - Get all invoices
- `POST /api/admin/invoices/auto-generate` - Auto-generate invoices
- `POST /api/admin/invoices/:id/send-reminder` - Send payment reminder

### Box Management (5 routes)
- `GET /api/admin/boxes` - Get all boxes
- `GET /api/admin/boxes/closed` - Get closed boxes
- `POST /api/admin/boxes/:id/close` - Close box
- `GET /api/admin/boxes/penalties` - Get boxes with penalties
- `POST /api/admin/boxes/:id/calculate-penalty` - Calculate box penalty

### Client Management (4 routes)
- `GET /api/admin/clients` - Get all clients
- `GET /api/admin/clients/:id` - Get single client
- `POST /api/admin/clients/:id/approve` - Approve client
- `POST /api/admin/clients/:id/reject` - Reject client

### Social Media (3 routes)
- `GET /api/admin/social/posts` - Get social media posts
- `POST /api/admin/social/posts` - Create social media post
- `POST /api/admin/social/posts/:id/publish` - Publish post

### Notifications (2 routes)
- `GET /api/admin/notifications` - Get notifications
- `POST /api/admin/notifications/send` - Send notification

---

## 🌐 KR Website Integration (3 routes)
- `GET /api/kr-websites/compare/:itemId` - Get price comparison
- `POST /api/kr-websites/crawl` - Crawl KR website data (Admin only)
- `GET /api/kr-websites/sale-alerts` - Get sale alerts

---

## 📊 Total Route Count

- **Public Routes**: 15 routes
- **Authenticated Routes**: 40+ routes
- **Admin Routes**: 25+ routes
- **Total**: **80+ API routes**

---

## 🗄️ Database Tables Required

1. `users` - User accounts
2. `products` - Product catalog
3. `product_variations` - Product variations (size, color, etc.)
4. `cart_items` - Shopping cart
5. `orders` - Orders
6. `order_items` - Order line items
7. `boxes` - Consolidation boxes
8. `box_items` - Items in boxes
9. `invoices` - Invoices
10. `invoice_items` - Invoice line items
11. `tracking_events` - Package tracking
12. `couriers` - Courier companies
13. `notifications` - User notifications
14. `bank_types` - Payment bank types
15. `box_types` - Box type options
16. `payment_history` - Payment records
17. `liked_items` - Wishlist items

---

## 🔑 Key Implementation Notes

1. **Authentication**: Use JWT tokens, verify on protected routes
2. **Authorization**: Check user role (admin, customer, solobox_client)
3. **Approval Status**: Non-admin users must be approved to access protected features
4. **UUID Format**: All IDs must be UUIDs
5. **Date Format**: ISO 8601 (UTC) for all timestamps
6. **Currency**: Support PHP and KRW
7. **Pagination**: Use `page` and `limit` query parameters
8. **Error Handling**: Consistent error response format
9. **CORS**: Configure for frontend domain
10. **Rate Limiting**: Implement on all endpoints

---

## 📦 Required npm Packages

```bash
npm install express pg postgres bcrypt jsonwebtoken cors dotenv multer express-rate-limit helmet express-validator qrcode pdfkit nodemailer cheerio axios
```

---

## 🚀 Quick Start Checklist

- [ ] Set up Express.js server
- [ ] Configure database connection (PostgreSQL)
- [ ] Create all database tables
- [ ] Set up authentication middleware
- [ ] Implement authentication routes
- [ ] Implement product routes
- [ ] Implement cart routes
- [ ] Implement order routes
- [ ] Implement payment routes
- [ ] Implement box routes
- [ ] Implement invoice routes
- [ ] Implement tracking routes
- [ ] Implement admin routes
- [ ] Set up CORS
- [ ] Configure environment variables
- [ ] Set up error handling
- [ ] Implement rate limiting
- [ ] Test all endpoints

---

For detailed implementation requirements, see `COMPLETE_BACKEND_API_REQUIREMENTS.md`

