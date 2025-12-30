// Shipping and consolidation types

export interface ShippingQuote {
  id: string;
  userId: string;
  origin: string; // "Korea"
  destination: string;
  items: ShippingItem[];
  totalWeight: number;
  totalVolume: number; // CBM
  shippingMethod: "sea" | "air" | "express";
  estimatedDays: number;
  baseCost: number;
  fuelSurcharge: number;
  customsFee: number;
  insuranceFee: number;
  totalCost: number;
  currency: "PHP";
  validUntil: Date;
  createdAt: Date;
}

export interface ShippingItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  value: number;
  category: string;
}

export interface BoxConsolidation {
  id: string;
  userId: string;
  boxNumber: string;
  status: "open" | "closed" | "shipped" | "delivered";
  items: ConsolidatedItem[];
  totalWeight: number;
  totalVolume: number;
  firstItemDate: Date;
  freePeriodEnd: Date;
  penaltyStartDate?: Date;
  dailyPenalty: number;
  currentPenalty?: number;
  closedAt?: Date;
  shippedAt?: Date;
  createdAt: Date;
}

export interface ConsolidatedItem {
  id: string;
  name: string;
  trackingNumber?: string;
  receivedAt: Date;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

