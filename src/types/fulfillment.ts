// Order fulfillment and Manila office types

import type { Address } from "./index";
import type { OrderItem } from "./orders";

export interface ManilaReceiving {
  id: string;
  orderId: string;
  orderNumber: string;
  trackingNumber?: string; // Korea shipping tracking
  items: ReceivedItem[];
  receivedBy: string; // Admin who received
  receivedAt: Date;
  condition: "good" | "damaged" | "missing_items";
  notes?: string;
  status: "received" | "in_storage" | "allocated" | "dispatched";
}

export interface ReceivedItem {
  id: string;
  orderItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  receivedQuantity: number; // May differ from ordered quantity
  condition: "good" | "damaged";
  notes?: string;
}

export interface ConsolidationBox {
  id: string;
  boxNumber: string;
  boxType: "solo" | "shared"; // Solo = one customer, Shared = multiple customers OR owner's personal items
  orders: string[]; // Order IDs in this box
  customers: BoxCustomer[]; // Customer details for shared boxes
  items: ConsolidatedBoxItem[];
  ownerPersonalItems?: OwnerPersonalItem[]; // Owner's personal items (only for shared boxes)
  totalWeight: number;
  totalVolume: number; // CBM
  status: "open" | "closed" | "ready_for_courier" | "dispatched" | "delivered";
  phCourierTrackingNumber?: string;
  phCourierName?: string;
  phCourierService?: "standard" | "express";
  createdAt: Date;
  closedAt?: Date;
  dispatchedAt?: Date;
  deliveredAt?: Date;
}

export interface OwnerPersonalItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  imageUrl?: string;
  notes?: string;
}

export interface BoxCustomer {
  orderId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: Address;
  items: ConsolidatedBoxItem[]; // Items belonging to this customer
}

export interface ConsolidatedBoxItem {
  id: string;
  orderId: string;
  orderItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  imageUrl?: string;
}

export interface CourierShipment {
  id: string;
  boxId: string;
  boxNumber: string;
  boxType: "solo" | "shared";
  courierName: string; // J&T Express, LBC, 2GO, etc.
  trackingNumber: string;
  serviceType: "standard" | "express";
  recipientAddress: Address;
  recipientName: string;
  recipientPhone: string;
  status: "pending" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered";
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  createdAt: Date;
  pickedUpAt?: Date;
}

export interface ManilaInventory {
  id: string;
  orderId: string;
  orderItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  location: string; // Warehouse location/section
  status: "received" | "allocated" | "shipped";
  receivedAt: Date;
  allocatedAt?: Date;
  shippedAt?: Date;
}

