-- Orders Table Schema
-- Run this to create the orders and order_items tables

-- Orders table
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

-- Order items table
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_box_id ON orders(box_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Add updated_at trigger for orders
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Add updated_at trigger for order_items
CREATE OR REPLACE FUNCTION update_order_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_order_items_updated_at
  BEFORE UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_items_updated_at();

