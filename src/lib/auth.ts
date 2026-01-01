// Authentication utilities - Now uses backend API

import { authService as apiAuthService, type LoginResponse } from "@/services/api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin" | "solobox_client";
  clientLevel?: "solobox" | "box_sharing" | "kr_to_kr" | "international";
  approvalStatus?: "pending" | "approved" | "rejected";
  isAuthenticated: boolean;
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
      const response: LoginResponse = await apiAuthService.login(email, password);
      
      // Store user in localStorage
      const user = response.user;
      currentUser = user;
      
      // Store token if provided
      if (response.token) {
        localStorage.setItem("hanbuy_token", response.token);
      }
      
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

