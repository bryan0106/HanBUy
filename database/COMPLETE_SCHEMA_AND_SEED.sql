-- =====================================================
-- HANBUY COMPLETE DATABASE SCHEMA AND SEED DATA
-- =====================================================
-- This file contains all CREATE TABLE statements first,
-- followed by all INSERT/seed data statements.
-- You can copy and paste each section separately.
-- =====================================================

-- =====================================================
-- SECTION 1: ALL CREATE TABLE STATEMENTS
-- =====================================================
-- Copy and paste everything from here to the next section
-- =====================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
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

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
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

-- 3. Product Variations Table
CREATE TABLE IF NOT EXISTS product_variations (
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

-- 4. Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  box_type_preference VARCHAR(50) DEFAULT 'solo' CHECK (box_type_preference IN ('solo', 'shared')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id, box_type_preference)
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  isf DECIMAL(10, 2) DEFAULT 0 CHECK (isf >= 0), -- International Service Fee (Korea to Manila)
  lsf DECIMAL(10, 2) DEFAULT 0 CHECK (lsf >= 0), -- Local Service Fee (Manila to customer)
  shipping_fee DECIMAL(10, 2) DEFAULT 0 CHECK (shipping_fee >= 0),
  solo_shipping_fee DECIMAL(10, 2) CHECK (solo_shipping_fee >= 0),
  shared_shipping_fee DECIMAL(10, 2) CHECK (shared_shipping_fee >= 0),
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  currency VARCHAR(10) DEFAULT 'PHP' CHECK (currency IN ('PHP', 'KRW')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'processing', 'packed', 
    'in_transit_to_manila', 'received_at_manila', 
    'consolidated', 'shipped', 'delivered', 'cancelled'
  )),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'partial', 'paid', 'failed', 'refunded'
  )),
  payment_type VARCHAR(50) DEFAULT 'full' CHECK (payment_type IN ('full', 'downpayment')),
  payment_method JSONB, -- { type: "qr_code", bank: "GCASH" }
  downpayment_amount DECIMAL(10, 2) CHECK (downpayment_amount >= 0),
  balance DECIMAL(10, 2) CHECK (balance >= 0),
  qr_code TEXT, -- Base64 QR code image
  box_type_preference VARCHAR(50) DEFAULT 'solo' CHECK (box_type_preference IN ('solo', 'shared')),
  shipping_address JSONB NOT NULL, -- { street, city, province, zipCode, country }
  fulfillment_status VARCHAR(50) CHECK (fulfillment_status IN (
    'pending_packing', 'packed', 'in_transit_to_manila', 
    'received_at_manila', 'consolidated', 'ready_for_delivery', 
    'out_for_delivery', 'delivered'
  )),
  box_id UUID REFERENCES boxes(id) ON DELETE SET NULL,
  ph_courier_tracking_number VARCHAR(100),
  ph_courier_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name VARCHAR(255) NOT NULL,
  product_type VARCHAR(50) NOT NULL CHECK (product_type IN ('onhand', 'preorder', 'kr_website')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  image_url TEXT,
  preorder_release_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Boxes Table
CREATE TABLE IF NOT EXISTS boxes (
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

-- 8. Box Items Table
CREATE TABLE IF NOT EXISTS box_items (
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

-- 9. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
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

-- 10. Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Couriers Table
CREATE TABLE IF NOT EXISTS couriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  tracking_url_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Tracking Events Table
CREATE TABLE IF NOT EXISTS tracking_events (
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

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Bank Types Table
CREATE TABLE IF NOT EXISTS bank_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Box Types Table
CREATE TABLE IF NOT EXISTS box_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Payment History Table
CREATE TABLE IF NOT EXISTS payment_history (
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

-- 17. Liked Items Table (Wishlist)
CREATE TABLE IF NOT EXISTS liked_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_box_id ON orders(box_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_boxes_user_id ON boxes(user_id);
CREATE INDEX IF NOT EXISTS idx_box_items_box_id ON box_items(box_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_tracking_number ON tracking_events(tracking_number);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers if they exist, then create them
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_products_updated_at ON products;
CREATE TRIGGER trigger_update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_cart_items_updated_at ON cart_items;
CREATE TRIGGER trigger_update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_orders_updated_at ON orders;
CREATE TRIGGER trigger_update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_order_items_updated_at ON order_items;
CREATE TRIGGER trigger_update_order_items_updated_at
  BEFORE UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_boxes_updated_at ON boxes;
CREATE TRIGGER trigger_update_boxes_updated_at
  BEFORE UPDATE ON boxes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_invoices_updated_at ON invoices;
CREATE TRIGGER trigger_update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- SECTION 2: ALL INSERT/SEED DATA STATEMENTS
-- =====================================================
-- Copy and paste everything from here to the end
-- =====================================================

-- Clear existing data (optional - uncomment if you want to reset)
-- TRUNCATE TABLE liked_items, payment_history, invoice_items, invoices, box_items, boxes, order_items, orders, cart_items, product_variations, products, notifications, tracking_events, couriers, box_types, bank_types, users CASCADE;

-- Insert Test Users
-- IMPORTANT: Password hashes below are PLACEHOLDERS
-- You MUST generate real bcrypt hashes in your backend before using these
-- Example in Node.js:
--   const bcrypt = require('bcrypt');
--   const hash = await bcrypt.hash('test123', 10);
--   // Use the generated hash in password_hash column
-- 
-- Test Accounts:
--   customer1@test.com / test123
--   customer2@test.com / test123  
--   customer3@test.com / test123
--   admin@hanbuy.com / admin123
INSERT INTO users (id, email, password_hash, name, phone, role, approval_status, address, created_at, updated_at) VALUES
('user-test-customer-1', 'customer1@test.com', '$2b$10$PLACEHOLDER_HASH_FOR_TEST123_REPLACE_IN_BACKEND', 'Maria Santos', '+63 912 345 6789', 'customer', 'approved', '{"street": "123 Rizal Street", "city": "Makati", "province": "Metro Manila", "zipCode": "1200", "country": "Philippines"}', '2024-01-15 00:00:00+00', '2024-01-15 00:00:00+00'),
('user-test-customer-2', 'customer2@test.com', '$2b$10$PLACEHOLDER_HASH_FOR_TEST123_REPLACE_IN_BACKEND', 'Juan Dela Cruz', '+63 923 456 7890', 'customer', 'approved', '{"street": "456 EDSA", "city": "Quezon City", "province": "Metro Manila", "zipCode": "1100", "country": "Philippines"}', '2024-02-01 00:00:00+00', '2024-02-01 00:00:00+00'),
('user-test-customer-3', 'customer3@test.com', '$2b$10$PLACEHOLDER_HASH_FOR_TEST123_REPLACE_IN_BACKEND', 'Ana Garcia', '+63 934 567 8901', 'customer', 'approved', '{"street": "789 Ayala Avenue", "city": "BGC", "province": "Taguig", "zipCode": "1634", "country": "Philippines"}', '2024-03-10 00:00:00+00', '2024-03-10 00:00:00+00'),
('user-test-admin', 'admin@hanbuy.com', '$2b$10$PLACEHOLDER_HASH_FOR_ADMIN123_REPLACE_IN_BACKEND', 'Admin User', '+63 900 000 0000', 'admin', 'approved', '{"street": "Manila Office", "city": "Manila", "province": "Metro Manila", "zipCode": "1000", "country": "Philippines"}', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Insert Box Types
INSERT INTO box_types (code, name, description, color) VALUES
('SOLO', 'SOLO', 'Solo Box - Full shipping fee', '#3B82F6'),
('SHARED', 'SHARED', 'Shared Box - Reduced shipping fee', '#10B981')
ON CONFLICT (code) DO NOTHING;

-- Insert Bank Types
INSERT INTO bank_types (code, name, color) VALUES
('GCASH', 'GCASH', '#0070F3'),
('PAYMAYA', 'PAYMAYA', '#00D9FF'),
('BPI', 'BPI', '#FF6B00'),
('BDO', 'BDO', '#FF0000'),
('METROBANK', 'Metrobank', '#FFD700'),
('UNIONBANK', 'UnionBank', '#8B0000')
ON CONFLICT (code) DO NOTHING;

-- Insert Couriers
INSERT INTO couriers (name, code, tracking_url_template) VALUES
('J&T Express', 'JNT', 'https://www.jtexpress.ph/track?trackingNumber={tracking_number}'),
('LBC Express', 'LBC', 'https://www.lbcexpress.com/track?trackingNumber={tracking_number}'),
('2GO', '2GO', 'https://2go.com.ph/track?trackingNumber={tracking_number}'),
('Flash Express', 'FLASH', 'https://flashexpress.com/track?trackingNumber={tracking_number}')
ON CONFLICT (code) DO NOTHING;

-- Insert Test Products
INSERT INTO products (id, name, description, price, currency, images, category, brand, sku, stock, weight, length, width, height, status, created_at, updated_at) VALUES
('prod-test-onhand-1', 'COSRX Advanced Snail 96 Mucin Power Essence', '96% snail secretion filtrate essence for skin repair', 25000, 'KRW', ARRAY['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500'], 'skincare', 'COSRX', 'COSRX-SNAIL-96', 50, 0.1, 15, 5, 20, 'onhand', '2024-01-15 00:00:00+00', '2024-12-20 00:00:00+00'),
('prod-test-onhand-2', 'Beauty of Joseon Relief Sun SPF50+', 'Rice extract sunscreen for sensitive skin', 18000, 'KRW', ARRAY['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500'], 'skincare', 'Beauty of Joseon', 'BOJ-SUN-50', 75, 0.08, 12, 4, 18, 'onhand', '2024-01-20 00:00:00+00', '2024-12-20 00:00:00+00'),
('prod-test-onhand-3', 'Samyang Buldak Hot Chicken Ramen (5 Pack)', 'Extremely spicy Korean instant noodles', 12000, 'KRW', ARRAY['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500'], 'food', 'Samyang', 'SAM-BULDAK-5', 100, 0.5, 25, 20, 15, 'onhand', '2024-02-01 00:00:00+00', '2024-12-20 00:00:00+00'),
('prod-test-preorder-1', 'Limited Edition K-Beauty Set 2025', 'Exclusive pre-order K-beauty collection', 85000, 'KRW', ARRAY['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500'], 'skincare', 'K-Beauty', 'KB-LIMITED-2025', 0, 0.5, 20, 15, 25, 'preorder', '2024-12-01 00:00:00+00', '2024-12-20 00:00:00+00'),
('prod-test-preorder-2', 'New Year Korean Snack Box', 'Special edition Korean snacks for New Year', 35000, 'KRW', ARRAY['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500'], 'food', 'Korean Snacks', 'KS-NY-2025', 0, 1.2, 30, 25, 20, 'preorder', '2024-12-05 00:00:00+00', '2024-12-20 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. Password Hashes: The password_hash values above are PLACEHOLDERS.
--    You MUST generate real bcrypt hashes in your backend before using.
--    Example: const hash = await bcrypt.hash('test123', 10);
--
-- 2. After running INSERT statements, update password hashes:
--    UPDATE users SET password_hash = '<generated_hash>' WHERE email = 'customer1@test.com';
--
-- 3. All INSERT statements use ON CONFLICT DO NOTHING to prevent errors
--    if data already exists. Safe to run multiple times.
--
-- 4. To reset all data, uncomment the TRUNCATE statement at the top
--    of Section 2 before running INSERT statements.
-- =====================================================

