# Test Data Documentation

This document describes the comprehensive test data available in `src/lib/testData.ts` for testing all features of the HanBuy platform.

## Test Accounts

### Customer Accounts

1. **Maria Santos** (customer1@test.com)
   - Password: `test123`
   - User ID: `user-test-customer-1`
   - Has orders with various statuses (delivered, in-transit, pre-order)
   - Has completed payments and pending payments
   - Uses both solo and shared box preferences

2. **Juan Dela Cruz** (customer2@test.com)
   - Password: `test123`
   - User ID: `user-test-customer-2`
   - Has mixed orders (onhand + preorder items)
   - Has paid orders and orders with downpayment

3. **Ana Garcia** (customer3@test.com)
   - Password: `test123`
   - User ID: `user-test-customer-3`
   - Has pending order waiting for payment
   - Good for testing payment flow

### Admin Account

- **Admin User** (admin@hanbuy.com)
   - Password: `admin123`
   - User ID: `user-test-admin`
   - Can access all admin features

## Test Data Coverage

### Products

#### Onhand Products
- **COSRX Advanced Snail 96 Mucin Power Essence** (prod-test-onhand-1)
  - Category: Skincare
  - Stock: 50 units
  - Price: ₩25,000

- **Beauty of Joseon Relief Sun SPF50+** (prod-test-onhand-2)
  - Category: Skincare
  - Stock: 75 units
  - Price: ₩18,000

- **Samyang Buldak Hot Chicken Ramen (5 Pack)** (prod-test-onhand-3)
  - Category: Food
  - Stock: 100 units
  - Price: ₩12,000

#### Pre-Order Products
- **Limited Edition K-Beauty Set 2025** (prod-test-preorder-1)
  - Category: Skincare
  - Stock: 0 (pre-order)
  - Release Date: January 15, 2025
  - Price: ₩85,000

- **New Year Korean Snack Box** (prod-test-preorder-2)
  - Category: Food
  - Stock: 0 (pre-order)
  - Release Date: January 10, 2025
  - Price: ₩35,000

### Orders

#### Order 1: ORD-2024-001
- **Customer**: Maria Santos
- **Status**: Delivered ✅
- **Payment**: Full payment (Paid via GCASH)
- **Items**: 2x COSRX Essence, 1x BOJ Sunscreen (Onhand items)
- **Box Type**: Solo
- **Features Tested**:
  - ✅ Onhand items ordering
  - ✅ Full payment (QR Code)
  - ✅ Solo box preference
  - ✅ Complete fulfillment workflow
  - ✅ Courier tracking (J&T Express)
  - ✅ Delivery completion

#### Order 2: ORD-2024-002
- **Customer**: Maria Santos
- **Status**: In Transit to Manila
- **Payment**: Downpayment (50% paid via MAYA)
- **Items**: 1x Limited Edition K-Beauty Set (Pre-order)
- **Box Type**: Shared
- **Features Tested**:
  - ✅ Pre-order items
  - ✅ Downpayment payment type
  - ✅ Shared box preference
  - ✅ Partial payment status
  - ✅ In-transit tracking

#### Order 3: ORD-2024-003
- **Customer**: Juan Dela Cruz
- **Status**: Received at Manila
- **Payment**: Full payment (Paid via BPI)
- **Items**: 3x Ramen, 1x Snack Box (Mixed: Onhand + Pre-order)
- **Box Type**: Shared
- **Features Tested**:
  - ✅ Mixed order types (onhand + preorder)
  - ✅ Full payment
  - ✅ Shared box with multiple items
  - ✅ Manila receiving status
  - ✅ Consolidation ready

#### Order 4: ORD-2024-004
- **Customer**: Ana Garcia
- **Status**: Pending
- **Payment**: Pending (QR Code generated for GOTYME)
- **Items**: 1x COSRX Essence (Onhand)
- **Box Type**: Solo
- **Features Tested**:
  - ✅ Pending payment flow
  - ✅ QR code generation
  - ✅ Payment awaiting status

#### Order 5: ORD-2024-005
- **Customer**: Juan Dela Cruz
- **Status**: Confirmed
- **Payment**: Downpayment paid (50% via BDO)
- **Items**: 2x Limited Edition K-Beauty Set (Pre-order)
- **Box Type**: Solo
- **Features Tested**:
  - ✅ Pre-order with downpayment
  - ✅ Balance remaining
  - ✅ Awaiting release date

### Payment Methods Covered

- ✅ **GCASH** - Full payment (Order 1)
- ✅ **MAYA** - Downpayment (Order 2)
- ✅ **BPI** - Full payment (Order 3)
- ✅ **GOTYME** - Pending payment (Order 4)
- ✅ **BDO** - Downpayment (Order 5)

### Fulfillment Workflow Coverage

1. **Pending Packing** - Order 4, Order 5
2. **Packed** - Order 1, Order 2, Order 3
3. **In Transit to Manila** - Order 2
4. **Received at Manila** - Order 3
5. **Consolidated** - Order 3 (in shared box)
6. **Shipped** - Order 1
7. **Delivered** - Order 1

### Box Types Covered

- ✅ **Solo Box** - Order 1, Order 4, Order 5
- ✅ **Shared Box** - Order 2, Order 3 (with owner's personal items)

### Service Fees Covered

- ✅ **ISF (International Service Fee)** - All orders
- ✅ **LSF (Local Service Fee)** - Different rates for solo vs shared boxes
- ✅ **Solo Shipping Fee** - Full fee for solo boxes
- ✅ **Shared Shipping Fee** - Reduced fee for shared boxes

### Additional Test Data

- ✅ **QR Payments** - Multiple QR codes for different banks
- ✅ **Boxes** - Complete tracking history
- ✅ **Invoices** - Detailed invoice with item breakdown
- ✅ **Manila Receiving** - Items received at Manila office
- ✅ **Consolidation Boxes** - Shared boxes with multiple customers
- ✅ **Courier Shipments** - J&T Express tracking

## How to Use Test Data

### Import Test Data

```typescript
import { 
  testData, 
  testAccounts, 
  getTestDataForUser 
} from '@/lib/testData';
```

### Access All Test Data

```typescript
const { users, products, orders, boxes, invoices } = testData;
```

### Get Data for Specific User

```typescript
const userData = getTestDataForUser('user-test-customer-1');
// Returns: { user, orders, boxes, invoices }
```

### Use Test Accounts for Login

```typescript
// Customer login
const customer = testAccounts.customers[0];
// email: "customer1@test.com"
// password: "test123"

// Admin login
const admin = testAccounts.admin;
// email: "admin@hanbuy.com"
// password: "admin123"
```

## Features Testing Checklist

Use this checklist to verify all features are working:

### Customer Features
- [ ] Browse products (onhand and preorder)
- [ ] Add items to cart
- [ ] Checkout process
- [ ] Select box type (solo/shared)
- [ ] View shipping fee breakdown (ISF + LSF)
- [ ] Payment options (full/downpayment)
- [ ] QR code payment (all banks: GCASH, MAYA, BPI, BDO, GOTYME)
- [ ] View order status
- [ ] Track orders
- [ ] View order history
- [ ] Monitor pre-order release dates
- [ ] View invoices
- [ ] Box tracking
- [ ] Items to receive

### Admin Features
- [ ] Inventory management
- [ ] Order management
- [ ] Payment verification
- [ ] Manila receiving
- [ ] Box consolidation (solo/shared)
- [ ] Add owner's personal items to shared boxes
- [ ] Courier shipment management
- [ ] Tracking number assignment
- [ ] Order status updates

### Payment Features
- [ ] Full payment
- [ ] Downpayment
- [ ] Balance tracking
- [ ] QR code generation (all banks)
- [ ] Payment verification
- [ ] Payment status updates

### Fulfillment Features
- [ ] Order packing
- [ ] Shipping to Manila
- [ ] Manila receiving
- [ ] Box consolidation
- [ ] Solo box creation
- [ ] Shared box creation (with multiple customers)
- [ ] Owner's personal items in shared boxes
- [ ] Courier assignment
- [ ] Tracking number generation
- [ ] Delivery tracking

## Testing Scenarios

### Scenario 1: Complete Order Flow (Onhand Items)
1. Login as customer1@test.com
2. View Order 1 (ORD-2024-001) - Delivered order
3. Check payment status (Paid)
4. View tracking history
5. Verify delivery completion

### Scenario 2: Pre-Order with Downpayment
1. Login as customer1@test.com
2. View Order 2 (ORD-2024-002) - Pre-order with downpayment
3. Check payment status (Partial - 50% paid)
4. View remaining balance
5. Check order status (In transit to Manila)
6. Monitor pre-order release date

### Scenario 3: Mixed Order Types
1. Login as customer2@test.com
2. View Order 3 (ORD-2024-003) - Mixed onhand + preorder
3. Verify shared box preference
4. Check Manila receiving status
5. View consolidation details

### Scenario 4: Pending Payment
1. Login as customer3@test.com
2. View Order 4 (ORD-2024-004) - Pending payment
3. Generate/View QR code
4. Test payment flow
5. Verify payment status update

### Scenario 5: Admin Fulfillment
1. Login as admin@hanbuy.com
2. View Manila receiving for Order 3
3. Create consolidation box (shared)
4. Add owner's personal items
5. Assign courier and tracking number
6. Update order statuses

## Notes

- All dates are set relative to December 2024/January 2025
- Prices are in KRW (Korean Won) for products
- Converted to PHP for display (approximate rate: 1 KRW = 0.042 PHP)
- All IDs follow a consistent pattern: `{type}-test-{number}`
- Test data can be extended by adding more items to the arrays

## Extending Test Data

To add more test data:

1. Add users to `testUsers` array
2. Add products to `testProducts` array
3. Add orders to `testOrders` array
4. Update related data (boxes, invoices, etc.) accordingly
5. Add test account credentials to `testAccounts`

Make sure to maintain relationships between data (user IDs, order IDs, etc.).

