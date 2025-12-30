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

