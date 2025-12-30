// Admin-specific types

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  brand?: string;
  price: number;
  currency: "KRW" | "PHP";
  quantity: number;
  minStock: number; // Alert threshold
  images: string[];
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  status: "onhand" | "preorder" | "out_of_stock";
  preorderDate?: Date;
  releaseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockAlert {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  minStock: number;
  alertType: "low_stock" | "out_of_stock";
  notified: boolean;
  createdAt: Date;
}

export interface SocialMediaPost {
  id: string;
  itemId: string;
  platform: "facebook" | "instagram" | "twitter";
  status: "draft" | "scheduled" | "posted";
  scheduledDate?: Date;
  postedDate?: Date;
  content: string;
  images: string[];
  createdAt: Date;
}

export interface ClientPenalty {
  id: string;
  userId: string;
  boxId: string;
  boxNumber: string;
  firstItemDate: Date;
  freePeriodEnd: Date;
  penaltyStartDate: Date;
  daysOverFree: number;
  penaltyAmount: number;
  status: "pending" | "paid" | "waived";
  notified: boolean;
  createdAt: Date;
}

export interface ClientApproval {
  id: string;
  userId: string;
  email: string;
  name: string;
  level: "solobox" | "box_sharing" | "kr_to_kr" | "international";
  status: "pending" | "approved" | "rejected";
  requestedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface KRWebsiteComparison {
  id: string;
  itemId: string;
  itemName: string;
  ourPrice: number;
  competitorPrices: {
    website: string;
    url: string;
    price: number;
    currency: "KRW";
    lastChecked: Date;
  }[];
  bestPrice: number;
  priceDifference: number;
  lastUpdated: Date;
}

export interface SaleAlert {
  id: string;
  itemId: string;
  itemName: string;
  website: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  url: string;
  notified: boolean;
  createdAt: Date;
}

