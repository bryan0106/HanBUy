// Enhanced tracking types

export interface Courier {
  id: string;
  name: string;
  code: string;
  website: string;
  trackingUrl: string;
  supported: boolean;
  apiAvailable: boolean;
}

export interface PackageTracking {
  id: string;
  trackingNumber: string;
  courier: Courier;
  status: TrackingStatus;
  currentLocation: string;
  events: TrackingEvent[];
  estimatedDelivery?: Date;
  delivered: boolean;
  deliveredAt?: Date;
  translated: boolean; // English translation available
  createdAt: Date;
  updatedAt: Date;
}

export type TrackingStatus =
  | "pending"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "exception"
  | "unknown";

export interface TrackingEvent {
  id: string;
  timestamp: Date;
  location: string;
  status: string;
  description: string;
  translatedDescription?: string; // English translation
}

export interface IncomingPackage {
  id: string;
  userId: string;
  trackingNumber: string;
  courier: string;
  description?: string;
  status: "pending" | "received" | "in_warehouse";
  receivedAt?: Date;
  createdAt: Date;
}

export interface OutgoingPackage {
  id: string;
  userId: string;
  boxId: string;
  trackingNumber: string;
  courier: string;
  status: "pending" | "shipped" | "in_transit" | "delivered";
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

