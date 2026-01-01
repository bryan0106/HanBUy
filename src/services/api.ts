// API service layer - Ready for backend integration
// Base URL: Update NEXT_PUBLIC_API_URL in .env.local

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://hanbuyapi.onrender.com/api";

// Log API URL in development (remove in production)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🔗 Backend API URL:", API_BASE_URL);
}

import { mockServices } from "@/lib/mockData";
import type { Product, Box, Invoice, TrackingEvent } from "@/types";
import type { User } from "@/lib/auth";

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
// TEMPORARY: Using mock data directly for testing (skip API calls)
export const productService = {
  getProducts: async (category?: string): Promise<Product[]> => {
    // TEMPORARY: Use mock data directly instead of API
    console.log("📦 Using mock data for products (temporary for testing)");
    return mockServices.getProducts(category);
    
    /* ORIGINAL API CODE (commented out for now):
    try {
      const url = category 
        ? `${API_BASE_URL}/products?category=${category}`
        : `${API_BASE_URL}/products`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle different response formats
        if (Array.isArray(data)) {
          return data;
        } else if (data && Array.isArray(data.products)) {
          return data.products;
        } else if (data && Array.isArray(data.data)) {
          return data.data;
        }
      }
      
      // Fallback to mock data if API fails
      console.warn("Failed to fetch products from API, using mock data");
      return mockServices.getProducts(category);
    } catch (error) {
      console.warn("Error fetching products from API, using mock data:", error);
      return mockServices.getProducts(category);
    }
    */
  },
  
  getProduct: async (id: string): Promise<Product | null> => {
    // TEMPORARY: Use mock data directly instead of API
    console.log("📦 Using mock data for product (temporary for testing)");
    return mockServices.getProduct(id);
    
    /* ORIGINAL API CODE (commented out for now):
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle different response formats
        if (data && data.id) {
          return data;
        } else if (data && data.product && data.product.id) {
          return data.product;
        } else if (data && data.data && data.data.id) {
          return data.data;
        }
      }
      
      // Fallback to mock data if API fails
      console.warn("Failed to fetch product from API, using mock data");
      return mockServices.getProduct(id);
    } catch (error) {
      console.warn("Error fetching product from API, using mock data:", error);
      return mockServices.getProduct(id);
    }
    */
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
   * @param apiUrl - Optional custom API URL (defaults to Render API)
   * @returns Array of bank types
   */
  getBankTypes: async (apiUrl?: string): Promise<BankType[]> => {
    const url = apiUrl || `${API_BASE_URL}/bank-type`;
    
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

// Cart services
export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_type: "onhand" | "preorder" | "kr_website";
  quantity: number;
  price: number;
  image_url?: string;
  box_type_preference?: "solo" | "shared";
  created_at?: string;
  updated_at?: string;
  // Product details (from join)
  product?: {
    id: string;
    name: string;
    price: number;
    currency: string;
    images: string[];
    stock: number;
  };
}

export interface AddToCartRequest {
  user_id: string;
  product_id: string;
  quantity: number;
  box_type_preference?: "solo" | "shared";
}

export const cartService = {
  /**
   * Get cart items for a user
   * @param userId - User ID (UUID)
   * @returns Array of cart items with product details
   */
  getCartItems: async (userId: string): Promise<CartItem[]> => {
    const url = `${API_BASE_URL}/cart?user_id=${userId}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 404 || response.status === 400) {
          // Empty cart or invalid request - return empty array
          return [];
        }
        throw new Error(`Cart API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      let cartItems: CartItem[] = [];
      
      if (Array.isArray(data)) {
        cartItems = data;
      } else if (data && Array.isArray(data.data)) {
        cartItems = data.data;
      } else if (data && data.cartItems && Array.isArray(data.cartItems)) {
        cartItems = data.cartItems;
      } else if (data && data.items && Array.isArray(data.items)) {
        cartItems = data.items;
      }
      
      return cartItems;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn("Cart API request timed out");
        throw new Error("Request timeout: Cart API did not respond in time");
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn("Cart API request failed - network error");
        throw new Error("Network error: Could not connect to Cart API");
      } else {
        console.error("Error fetching cart items:", error);
        throw error;
      }
    }
  },

  /**
   * Add item to cart (upserts if item already exists)
   * @param request - Add to cart request
   * @returns Updated cart item
   */
  addToCart: async (request: AddToCartRequest): Promise<CartItem> => {
    const url = `${API_BASE_URL}/cart`;
    
    // Validate UUIDs before sending
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(request.user_id)) {
      throw new Error(`Invalid user_id format. Expected UUID, got: ${request.user_id}`);
    }
    if (!uuidRegex.test(request.product_id)) {
      throw new Error(`Invalid product_id format. Expected UUID, got: ${request.product_id}`);
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorMessage = `Cart API returned ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      if (data && data.id) {
        return data;
      } else if (data && data.data && data.data.id) {
        return data.data;
      } else if (data && data.cartItem && data.cartItem.id) {
        return data.cartItem;
      } else {
        throw new Error("Invalid response format from Cart API");
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn("Cart API request timed out");
        throw new Error("Request timeout: Cart API did not respond in time");
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn("Cart API request failed - network error");
        throw new Error("Network error: Could not connect to Cart API");
      } else {
        console.error("Error adding to cart:", error);
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
   * @param apiUrl - Optional custom API URL (defaults to Render API)
   * @returns Array of box types
   */
  getBoxTypes: async (apiUrl?: string): Promise<BoxType[]> => {
    const url = apiUrl || `${API_BASE_URL}/box-type`;
    
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

// Authentication services
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token?: string; // Optional JWT token if backend provides it
}

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "customer" | "admin" | "solobox_client";
  client_level?: "solobox" | "box_sharing" | "kr_to_kr" | "international";
  approval_status?: "pending" | "approved" | "rejected";
  address?: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
    country: string;
  };
  created_at?: string;
  updated_at?: string;
}

export const authService = {
  /**
   * Login with email and password
   * 
   * Backend API Requirements:
   * - Verifies password using bcrypt.compare() against stored password_hash
   * - Checks approval_status: rejects non-approved users UNLESS role is 'admin'
   * - Returns user data WITHOUT password_hash field
   * 
   * @param email - User email
   * @param password - User password
   * @returns User data (without password hash) and optional token
   * @throws Error with message:
   *   - "Invalid email or password" (401)
   *   - "Account not approved. Please wait for admin approval." (403)
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const url = `${API_BASE_URL}/auth/login`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorMessage = `Login failed: ${response.status}`;
        let errorData: any = null;
        
        try {
          const responseText = await response.text();
          if (responseText) {
            try {
              errorData = JSON.parse(responseText);
              if (errorData?.error) {
                errorMessage = errorData.error;
              } else if (errorData?.message) {
                errorMessage = errorData.message;
              }
            } catch {
              // If JSON parse fails, use text as error message
              errorMessage = responseText || response.statusText || errorMessage;
            }
          }
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage;
        }
        
        // Log error details in development for debugging
        if (process.env.NODE_ENV === "development") {
          console.error("Login API Error:", {
            status: response.status,
            statusText: response.statusText,
            errorData: errorData || "No error data",
            url: response.url,
            statusCode: response.status
          });
        }
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error("Invalid email or password");
        } else if (response.status === 403) {
          throw new Error("Account not approved. Please wait for admin approval.");
        } else {
          throw new Error(errorMessage);
        }
      }
      
      const data = await response.json();
      
      // Handle different response formats
      let user: ApiUser;
      let token: string | undefined;
      
      if (data.user) {
        user = data.user;
        token = data.token;
      } else if (data.id) {
        user = data;
        token = data.token;
      } else {
        throw new Error("Invalid response format from login API");
      }
      
      // Convert API user format to frontend User format
      const frontendUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientLevel: user.client_level,
        approvalStatus: user.approval_status,
        isAuthenticated: true,
      };
      
      return {
        user: frontendUser,
        token,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn("Login request timed out");
        throw new Error("Request timeout: Login service did not respond in time");
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn("Login request failed - network error");
        throw new Error("Network error: Could not connect to login service");
      } else {
        console.error("Error during login:", error);
        throw error;
      }
    }
  },
};

// User services
export const userService = {
  /**
   * Get users with optional filtering
   * @param filters - Optional filters for role and approval_status
   * @returns Array of users (password hash excluded)
   */
  getUsers: async (filters?: {
    role?: "customer" | "admin" | "solobox_client";
    approval_status?: "pending" | "approved" | "rejected";
  }): Promise<ApiUser[]> => {
    const url = new URL(`${API_BASE_URL}/users`);
    
    if (filters?.role) {
      url.searchParams.append('role', filters.role);
    }
    if (filters?.approval_status) {
      url.searchParams.append('approval_status', filters.approval_status);
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Users API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.users)) {
        return data.users;
      } else if (data && Array.isArray(data.data)) {
        return data.data;
      }
      
      return [];
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn("Users API request timed out");
        throw new Error("Request timeout: Users API did not respond in time");
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn("Users API request failed - network error");
        throw new Error("Network error: Could not connect to Users API");
      } else {
        console.error("Error fetching users:", error);
        throw error;
      }
    }
  },

  /**
   * Get specific user by ID
   * @param userId - User ID (UUID)
   * @returns User data (password hash excluded)
   */
  getUser: async (userId: string): Promise<ApiUser | null> => {
    const url = `${API_BASE_URL}/users/${userId}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`User API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      if (data && data.id) {
        return data;
      } else if (data && data.user && data.user.id) {
        return data.user;
      } else if (data && data.data && data.data.id) {
        return data.data;
      }
      
      return null;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn("User API request timed out");
        throw new Error("Request timeout: User API did not respond in time");
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn("User API request failed - network error");
        throw new Error("Network error: Could not connect to User API");
      } else {
        console.error("Error fetching user:", error);
        throw error;
      }
    }
  },

  /**
   * Update user information
   * @param userId - User ID (UUID)
   * @param updates - User fields to update
   * @returns Updated user data
   */
  updateUser: async (
    userId: string,
    updates: Partial<{
      name: string;
      phone: string;
      address: {
        street: string;
        city: string;
        province: string;
        zipCode: string;
        country: string;
      };
      client_level: "solobox" | "box_sharing" | "kr_to_kr" | "international";
      approval_status: "pending" | "approved" | "rejected";
    }>
  ): Promise<ApiUser> => {
    const url = `${API_BASE_URL}/users/${userId}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'PUT',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorMessage = `Update user failed: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      if (data && data.id) {
        return data;
      } else if (data && data.user && data.user.id) {
        return data.user;
      } else if (data && data.data && data.data.id) {
        return data.data;
      }
      
      throw new Error("Invalid response format from update user API");
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn("Update user request timed out");
        throw new Error("Request timeout: Update user API did not respond in time");
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn("Update user request failed - network error");
        throw new Error("Network error: Could not connect to update user API");
      } else {
        console.error("Error updating user:", error);
        throw error;
      }
    }
  },
};

