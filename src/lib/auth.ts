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
    // Default admin account (email only)
    if (email.toLowerCase() === "admin@hanbuy.com") {
      if (password === "admin") {
        const adminUser: User = {
          id: "admin-1",
          email: "admin@hanbuy.com",
          name: "Admin",
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

    // Mock login - accept any other credentials for demo (regular customers)
    const user: User = {
      id: "user-1",
      email,
      name: email.split("@")[0],
      role: "customer",
      isAuthenticated: true,
    };
    mockUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem("hanbuy_user", JSON.stringify(user));
    }
    return user;
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

