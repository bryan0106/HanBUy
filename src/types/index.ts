// Core TypeScript interfaces for HanBuy platform

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  zipCode: string;
  country: string;
}

export interface Box {
  id: string;
  userId: string;
  boxNumber: string;
  status: BoxStatus;
  items: Item[];
  currentLocation?: string;
  trackingHistory: TrackingEvent[];
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
}

export type BoxStatus =
  | "in_warehouse"
  | "in_transit"
  | "in_customs"
  | "at_ph_hub"
  | "out_for_delivery"
  | "delivered";

export interface Item {
  id: string;
  boxId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  currency: "KRW" | "PHP";
  weight: number; // in kg
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  imageUrl?: string;
  sku?: string;
  createdAt: Date;
}

export interface TrackingEvent {
  id: string;
  boxId: string;
  status: BoxStatus;
  location: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface Invoice {
  id: string;
  userId: string;
  boxId?: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  shippingFee: number;
  customsFee?: number;
  total: number;
  currency: "PHP" | "KRW";
  status: InvoiceStatus;
  dueDate: Date;
  paidAt?: Date;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type InvoiceStatus = "pending" | "paid" | "unpaid" | "overdue";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ProductVariation {
  id: string;
  name: string; // e.g., "Size: Large", "Color: Red"
  type: "size" | "color" | "other";
  value: string; // e.g., "Large", "Red"
  priceModifier?: number; // Additional price for this variation (can be negative)
  stock: number;
  sku?: string;
  imageUrl?: string; // Optional image for this specific variation
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: "KRW";
  images: string[];
  category: string;
  brand?: string;
  sku: string;
  stock: number;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  seoTitle?: string;
  seoDescription?: string;
  variations?: ProductVariation[]; // Optional variations (size, color, etc.)
  itemType?: string; // Item type (Album, Ticket, Bag, Accessories, Poster, Clothing, Item)
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

