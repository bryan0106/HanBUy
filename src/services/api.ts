// API service layer - Ready for backend integration
// Base URL: Update NEXT_PUBLIC_API_URL in .env.local

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Log API URL in development (remove in production)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🔗 Backend API URL:", API_BASE_URL);
}

import { mockServices } from "@/lib/mockData";
import type { Product, Box, Invoice, TrackingEvent } from "@/types";

// Box services
export const boxService = {
  getBox: async (userId: string): Promise<Box | null> => {
    return mockServices.getBox(userId);
  },
  getUserBoxes: async (userId: string): Promise<Box[]> => {
    const box = await mockServices.getBox(userId);
    return box ? [box] : [];
  },
};

// Product services
export const productService = {
  getProducts: async (category?: string): Promise<Product[]> => {
    return mockServices.getProducts(category);
  },
  getProduct: async (id: string): Promise<Product | null> => {
    return mockServices.getProduct(id);
  },
};

// Invoice services
export const invoiceService = {
  getInvoice: async (invoiceId: string): Promise<Invoice | null> => {
    const invoices = await mockServices.getInvoices("user-1");
    return invoices.find((inv) => inv.id === invoiceId) || null;
  },
  getUserInvoices: async (userId: string): Promise<Invoice[]> => {
    return mockServices.getInvoices(userId);
  },
  downloadInvoicePDF: async (invoiceId: string): Promise<void> => {
    // Mock PDF download - in real app, this would trigger a download
    console.log("Downloading invoice PDF:", invoiceId);
    // Simulate download
    await new Promise((resolve) => setTimeout(resolve, 500));
    alert("Invoice PDF download started (mock)");
  },
};

// Tracking services
export const trackingService = {
  getTrackingEvents: async (trackingId: string): Promise<TrackingEvent[]> => {
    return mockServices.getTracking(trackingId);
  },
  searchTracking: async (trackingId: string): Promise<TrackingEvent[]> => {
    return mockServices.getTracking(trackingId);
  },
};

