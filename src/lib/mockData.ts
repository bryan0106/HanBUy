// Mock data for frontend-only development

import type {
  Product,
  Box,
  Item,
  Invoice,
  TrackingEvent,
  Category,
} from "@/types";

export const categories: Category[] = [
  {
    id: "1",
    name: "Skincare",
    slug: "skincare",
    description: "Korean skincare products",
    imageUrl: "/categories/skincare.jpg",
  },
  {
    id: "2",
    name: "Food",
    slug: "food",
    description: "Korean food and snacks",
    imageUrl: "/categories/food.jpg",
  },
  {
    id: "3",
    name: "Fashion",
    slug: "fashion",
    description: "Korean fashion and apparel",
    imageUrl: "/categories/fashion.jpg",
  },
];

export const mockProducts: Product[] = [
  // Skincare
  {
    id: "prod-1",
    name: "COSRX Advanced Snail 96 Mucin Power Essence",
    description:
      "A lightweight essence with 96% snail secretion filtrate to help repair and soothe damaged skin.",
    price: 25000,
    currency: "KRW",
    images: [
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500",
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500",
    ],
    category: "skincare",
    brand: "COSRX",
    sku: "COSRX-SNAIL-96",
    stock: 50,
    weight: 0.1,
    dimensions: { length: 15, width: 5, height: 20 },
    seoTitle: "COSRX Snail Essence - Korean Skincare",
    seoDescription: "96% snail mucin essence for hydrated, glowing skin",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "prod-2",
    name: "Beauty of Joseon Relief Sun: Rice + Probiotics",
    description:
      "SPF50+ PA++++ sunscreen with rice extract and probiotics for sensitive skin.",
    price: 18000,
    currency: "KRW",
    images: ["https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500"],
    category: "skincare",
    brand: "Beauty of Joseon",
    sku: "BOJ-SUN-50",
    stock: 75,
    weight: 0.08,
    dimensions: { length: 12, width: 4, height: 18 },
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "prod-3",
    name: "Laneige Water Bank Hyaluronic Cream",
    description:
      "Intensive hydrating cream with hyaluronic acid and mineral water.",
    price: 35000,
    currency: "KRW",
    images: ["https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500"],
    category: "skincare",
    brand: "Laneige",
    sku: "LAN-WB-HC",
    stock: 30,
    weight: 0.15,
    dimensions: { length: 10, width: 10, height: 5 },
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-01-25"),
  },
  // Food
  {
    id: "prod-4",
    name: "Samyang Buldak Hot Chicken Ramen (5 Pack)",
    description: "Extremely spicy Korean instant noodles - 5 pack bundle.",
    price: 12000,
    currency: "KRW",
    images: ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500"],
    category: "food",
    brand: "Samyang",
    sku: "SAM-BULDAK-5",
    stock: 100,
    weight: 0.5,
    dimensions: { length: 25, width: 20, height: 15 },
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "prod-5",
    name: "Honey Butter Almonds (Large Pack)",
    description: "Sweet and savory Korean honey butter almonds - 200g pack.",
    price: 8500,
    currency: "KRW",
    images: ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500"],
    category: "food",
    brand: "HBA",
    sku: "HBA-ALMOND-200",
    stock: 80,
    weight: 0.25,
    dimensions: { length: 18, width: 12, height: 8 },
    createdAt: new Date("2024-02-05"),
    updatedAt: new Date("2024-02-05"),
  },
  {
    id: "prod-6",
    name: "Korean Rice Cakes (Tteokbokki) - 500g",
    description: "Fresh Korean rice cakes perfect for making tteokbokki at home.",
    price: 6000,
    currency: "KRW",
    images: ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500"],
    category: "food",
    brand: "Korean Kitchen",
    sku: "KK-TTEOK-500",
    stock: 60,
    weight: 0.5,
    dimensions: { length: 20, width: 15, height: 10 },
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10"),
  },
  // Fashion
  {
    id: "prod-7",
    name: "Korean Street Style Oversized Hoodie",
    description:
      "Comfortable oversized hoodie with modern Korean streetwear design.",
    price: 45000,
    currency: "KRW",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500"],
    category: "fashion",
    brand: "Seoul Street",
    sku: "SS-HOODIE-OS",
    stock: 40,
    weight: 0.6,
    dimensions: { length: 35, width: 30, height: 5 },
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
  },
  {
    id: "prod-8",
    name: "K-Beauty Inspired Face Mask Set (10pcs)",
    description: "Variety pack of Korean sheet masks for all skin types.",
    price: 15000,
    currency: "KRW",
    images: ["https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500"],
    category: "skincare",
    brand: "Mask Republic",
    sku: "MR-MASK-10",
    stock: 90,
    weight: 0.3,
    dimensions: { length: 20, width: 15, height: 8 },
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20"),
  },
];

export const mockBox: Box = {
  id: "box-1",
  userId: "user-1",
  boxNumber: "HB-2024-001",
  status: "in_warehouse",
  currentLocation: "Seoul Warehouse, Korea",
  items: [
    {
      id: "item-1",
      boxId: "box-1",
      name: "COSRX Advanced Snail 96 Mucin Power Essence",
      description: "96% snail secretion filtrate essence",
      quantity: 2,
      price: 25000,
      currency: "KRW",
      weight: 0.1,
      dimensions: { length: 15, width: 5, height: 20 },
      imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200",
      sku: "COSRX-SNAIL-96",
      createdAt: new Date("2024-12-01"),
    },
    {
      id: "item-2",
      boxId: "box-1",
      name: "Samyang Buldak Hot Chicken Ramen (5 Pack)",
      description: "Extremely spicy Korean instant noodles",
      quantity: 1,
      price: 12000,
      currency: "KRW",
      weight: 0.5,
      dimensions: { length: 25, width: 20, height: 15 },
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200",
      sku: "SAM-BULDAK-5",
      createdAt: new Date("2024-12-05"),
    },
  ],
  trackingHistory: [],
  createdAt: new Date("2024-12-01"),
  updatedAt: new Date("2024-12-10"),
  estimatedDelivery: new Date("2024-12-25"),
};

export const mockTrackingEvents: Record<string, TrackingEvent[]> = {
  "HB-2024-001": [
    {
      id: "track-1",
      boxId: "box-1",
      status: "in_warehouse",
      location: "Seoul Warehouse, Korea",
      description: "Package received at warehouse",
      timestamp: new Date("2024-12-01T10:00:00"),
    },
    {
      id: "track-2",
      boxId: "box-1",
      status: "in_transit",
      location: "Incheon Airport, Korea",
      description: "Departed Incheon - In transit to Philippines",
      timestamp: new Date("2024-12-05T14:30:00"),
    },
    {
      id: "track-3",
      boxId: "box-1",
      status: "in_customs",
      location: "Manila Port, Philippines",
      description: "Arrived Manila Port - Awaiting customs clearance",
      timestamp: new Date("2024-12-08T09:15:00"),
    },
  ],
  "HB-2024-002": [
    {
      id: "track-4",
      boxId: "box-2",
      status: "at_ph_hub",
      location: "Manila Hub, Philippines",
      description: "Cleared customs - At PH Hub",
      timestamp: new Date("2024-12-10T11:00:00"),
    },
    {
      id: "track-5",
      boxId: "box-2",
      status: "out_for_delivery",
      location: "Quezon City, Philippines",
      description: "Out for delivery",
      timestamp: new Date("2024-12-12T08:00:00"),
    },
  ],
};

export const mockInvoices: Invoice[] = [
  {
    id: "inv-1",
    userId: "user-1",
    boxId: "box-1",
    invoiceNumber: "INV-2024-001",
    items: [
      {
        id: "inv-item-1",
        description: "COSRX Advanced Snail 96 Mucin Power Essence x2",
        quantity: 2,
        unitPrice: 1042.5,
        total: 2085,
      },
      {
        id: "inv-item-2",
        description: "Samyang Buldak Hot Chicken Ramen (5 Pack) x1",
        quantity: 1,
        unitPrice: 500,
        total: 500,
      },
    ],
    subtotal: 2585,
    shippingFee: 500,
    customsFee: 200,
    total: 3285,
    currency: "PHP",
    status: "pending",
    dueDate: new Date("2024-12-20"),
    createdAt: new Date("2024-12-10"),
    updatedAt: new Date("2024-12-10"),
  },
  {
    id: "inv-2",
    userId: "user-1",
    boxId: "box-2",
    invoiceNumber: "INV-2024-002",
    items: [
      {
        id: "inv-item-3",
        description: "Korean Street Style Oversized Hoodie x1",
        quantity: 1,
        unitPrice: 1875,
        total: 1875,
      },
    ],
    subtotal: 1875,
    shippingFee: 400,
    customsFee: 150,
    total: 2425,
    currency: "PHP",
    status: "paid",
    dueDate: new Date("2024-11-30"),
    paidAt: new Date("2024-11-25"),
    paymentMethod: "GCash",
    createdAt: new Date("2024-11-20"),
    updatedAt: new Date("2024-11-25"),
  },
];

// Mock service functions
export const mockServices = {
  getProducts: (category?: string): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (category) {
          resolve(mockProducts.filter((p) => p.category === category));
        } else {
          resolve(mockProducts);
        }
      }, 300);
    });
  },
  getProduct: (id: string): Promise<Product | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockProducts.find((p) => p.id === id) || null);
      }, 200);
    });
  },
  getBox: (userId: string): Promise<Box | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockBox);
      }, 300);
    });
  },
  getTracking: (trackingId: string): Promise<TrackingEvent[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTrackingEvents[trackingId] || []);
      }, 400);
    });
  },
  getInvoices: (userId: string): Promise<Invoice[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockInvoices);
      }, 300);
    });
  },
};

