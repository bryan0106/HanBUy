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

// Bank services
export interface BankType {
  code: string;
  name: string;
  color?: string;
}

export const bankService = {
  /**
   * Fetch bank types from Express.js API
   * @param apiUrl - Optional custom API URL (defaults to http://localhost:5173/api/bank-type)
   * @returns Array of bank types
   */
  getBankTypes: async (apiUrl?: string): Promise<BankType[]> => {
    const url = apiUrl || "http://localhost:5173/api/bank-type";
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Bank API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      let banks: BankType[] = [];
      
      if (Array.isArray(data)) {
        banks = data;
      } else if (data && Array.isArray(data.data)) {
        banks = data.data;
      } else if (data && data.banks && Array.isArray(data.banks)) {
        banks = data.banks;
      } else if (data && data.bankTypes && Array.isArray(data.bankTypes)) {
        banks = data.bankTypes;
      } else if (data && typeof data === 'object') {
        // If it's a single object, wrap it in an array
        banks = [data];
      }
      
      // Validate that we have valid bank objects
      if (banks.length > 0) {
        // Ensure each item has at least a code or name
        const validBanks = banks.filter(bank => bank && (bank.code || bank.name));
        if (validBanks.length > 0) {
          return validBanks;
        }
      }
      
      // Return empty array instead of throwing - let the UI handle fallback
      console.warn("Bank API returned no valid banks, using empty array");
      return [];
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn("Bank API request timed out");
        throw new Error("Request timeout: Bank API did not respond in time");
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn("Bank API request failed - network error");
        throw new Error("Network error: Could not connect to Bank API");
      } else {
        console.error("Error fetching bank types:", error);
        throw error;
      }
    }
  },
};

// Box Type services
export interface BoxType {
  code: string;
  name: string;
  description?: string;
  color?: string;
}

export const boxTypeService = {
  /**
   * Fetch box types from Express.js API
   * @param apiUrl - Optional custom API URL (defaults to http://localhost:5173/api/box-type)
   * @returns Array of box types
   */
  getBoxTypes: async (apiUrl?: string): Promise<BoxType[]> => {
    const url = apiUrl || "http://localhost:5173/api/box-type";
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Box Type API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      let boxTypes: BoxType[] = [];
      
      if (Array.isArray(data)) {
        boxTypes = data;
      } else if (data && Array.isArray(data.data)) {
        boxTypes = data.data;
      } else if (data && data.boxTypes && Array.isArray(data.boxTypes)) {
        boxTypes = data.boxTypes;
      } else if (data && typeof data === 'object') {
        // If it's a single object, wrap it in an array
        boxTypes = [data];
      }
      
      // Validate that we have valid box type objects
      if (boxTypes.length > 0) {
        // Ensure each item has at least a code or name
        const validBoxTypes = boxTypes.filter(bt => bt && (bt.code || bt.name));
        if (validBoxTypes.length > 0) {
          return validBoxTypes;
        }
      }
      
      // Return empty array instead of throwing - let the UI handle fallback
      console.warn("Box Type API returned no valid box types, using empty array");
      return [];
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn("Box Type API request timed out");
        throw new Error("Request timeout: Box Type API did not respond in time");
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn("Box Type API request failed - network error");
        throw new Error("Network error: Could not connect to Box Type API");
      } else {
        console.error("Error fetching box types:", error);
        throw error;
      }
    }
  },
};

