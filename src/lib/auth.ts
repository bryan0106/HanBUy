// Authentication utilities - Uses backend API via modular services

import { authService as apiAuthService } from "@/services/authService";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin" | "solobox_client";
  clientLevel?: "solobox" | "box_sharing" | "kr_to_kr" | "international";
  approvalStatus?: "pending" | "approved" | "rejected";
  installmentApproved?: boolean; // Whether customer is approved for installment payment
  isAuthenticated: boolean;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    zipCode?: string;
    country?: string;
    region?: string;
  };
}

// Authentication state (stored in localStorage)
let currentUser: User | null = null;

export const authService = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    // Check localStorage for auth
    const stored = localStorage.getItem("hanbuy_user");
    if (stored) {
      try {
        currentUser = JSON.parse(stored);
        return currentUser?.isAuthenticated || false;
      } catch {
        return false;
      }
    }
    return false;
  },

  // Get current user
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null;
    if (currentUser) return currentUser;
    const stored = localStorage.getItem("hanbuy_user");
    if (stored) {
      try {
        currentUser = JSON.parse(stored);
        return currentUser;
      } catch {
        return null;
      }
    }
    return null;
  },

  // Login with backend API
  login: async (email: string, password: string): Promise<User> => {
    try {
      // Call backend API
      const response = await apiAuthService.login(email, password);

      // Map backend user shape to frontend auth user shape
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        clientLevel: response.user.client_level,
        approvalStatus: response.user.approval_status,
        installmentApproved: response.user.installment_approved,
        isAuthenticated: true,
        phone: response.user.phone,
        address: response.user.address
          ? {
              street: response.user.address.street || undefined,
              city: response.user.address.city || undefined,
              province: response.user.address.province || undefined,
              zipCode: response.user.address.zipCode || undefined,
              country: response.user.address.country || undefined,
              region: response.user.address.region || undefined,
            }
          : undefined,
      };

      // Store user in localStorage
      currentUser = user;
      
      // Store token if provided
      localStorage.setItem("hanbuy_token", response.token);
      
      // Store user data
      if (typeof window !== "undefined") {
        localStorage.setItem("hanbuy_user", JSON.stringify(user));
      }
      
      return user;
    } catch (error: any) {
      // Re-throw error with user-friendly message
      if (error.message) {
        throw error;
      }
      throw new Error("Login failed. Please check your credentials and try again.");
    }
  },

  // Logout
  logout: (): void => {
    currentUser = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("hanbuy_user");
      localStorage.removeItem("hanbuy_token");
    }
  },

  // Check if user is admin
  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === "admin" || false;
  },

  // Check if user is customer
  isCustomer: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === "customer" || false;
  },
};

