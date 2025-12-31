// Authentication utilities (mock for frontend-only)

export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin" | "solobox_client";
  clientLevel?: "solobox" | "box_sharing" | "kr_to_kr" | "international";
  approvalStatus?: "pending" | "approved" | "rejected";
  isAuthenticated: boolean;
}

// Mock authentication state (in real app, this would come from session/cookies)
let mockUser: User | null = null;

export const authService = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    // Check localStorage for mock auth
    const stored = localStorage.getItem("hanbuy_user");
    if (stored) {
      mockUser = JSON.parse(stored);
      return mockUser?.isAuthenticated || false;
    }
    return false;
  },

  // Get current user
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null;
    if (mockUser) return mockUser;
    const stored = localStorage.getItem("hanbuy_user");
    if (stored) {
      mockUser = JSON.parse(stored);
      return mockUser;
    }
    return null;
  },

  // Mock login (in real app, this would call API)
  login: async (email: string, password: string): Promise<User> => {
    const emailLower = email.toLowerCase();

    // Admin account
    if (emailLower === "admin@hanbuy.com") {
      if (password === "admin" || password === "admin123") {
        const adminUser: User = {
          id: "user-test-admin",
          email: "admin@hanbuy.com",
          name: "Admin User",
          role: "admin",
          isAuthenticated: true,
        };
        mockUser = adminUser;
        if (typeof window !== "undefined") {
          localStorage.setItem("hanbuy_user", JSON.stringify(adminUser));
        }
        return adminUser;
      } else {
        throw new Error("Invalid password for admin account");
      }
    }

    // Test customer accounts
    if (emailLower === "customer1@test.com" && password === "test123") {
      const user: User = {
        id: "user-test-customer-1",
        email: "customer1@test.com",
        name: "Maria Santos",
        role: "customer",
        isAuthenticated: true,
      };
      mockUser = user;
      if (typeof window !== "undefined") {
        localStorage.setItem("hanbuy_user", JSON.stringify(user));
      }
      return user;
    }

    if (emailLower === "customer2@test.com" && password === "test123") {
      const user: User = {
        id: "user-test-customer-2",
        email: "customer2@test.com",
        name: "Juan Dela Cruz",
        role: "customer",
        isAuthenticated: true,
      };
      mockUser = user;
      if (typeof window !== "undefined") {
        localStorage.setItem("hanbuy_user", JSON.stringify(user));
      }
      return user;
    }

    if (emailLower === "customer3@test.com" && password === "test123") {
      const user: User = {
        id: "user-test-customer-3",
        email: "customer3@test.com",
        name: "Ana Garcia",
        role: "customer",
        isAuthenticated: true,
      };
      mockUser = user;
      if (typeof window !== "undefined") {
        localStorage.setItem("hanbuy_user", JSON.stringify(user));
      }
      return user;
    }

    // Default: reject invalid credentials (don't accept any email/password)
    throw new Error("Invalid email or password. Please use test accounts.");
  },

  // Logout
  logout: (): void => {
    mockUser = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("hanbuy_user");
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

