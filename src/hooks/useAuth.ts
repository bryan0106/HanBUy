"use client";

import { useState, useEffect } from "react";
import { authService, type User } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();

    // Listen for storage changes (logout from other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log("🔐 useAuth: Attempting login...");
      const loggedInUser = await authService.login(email, password);
      console.log("✅ useAuth: Login successful, setting user:", loggedInUser);
      setUser(loggedInUser);
      setLoading(false);
      
      // Force a re-check of auth state
      const currentUser = authService.getCurrentUser();
      console.log("🔍 useAuth: Current user after login:", currentUser);
      
      return loggedInUser;
    } catch (error) {
      console.error("❌ useAuth: Login failed:", error);
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isCustomer: user?.role === "customer",
    loading,
    login,
    logout,
  };
}

