"use client";

import { useState, useEffect, useCallback } from "react";
import { authService, type User } from "@/services/authService";
import { handleApiError } from "@/utils/errorHandler";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    // First check localStorage for cached user
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('hanbuy_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setLoading(false);
          
          // Optionally verify with API
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            // Update localStorage with fresh data
            localStorage.setItem('hanbuy_user', JSON.stringify(currentUser));
          } catch (err) {
            // If API call fails, keep cached user but log error
            console.warn('Failed to verify user with API, using cached user');
          }
          return;
        } catch {
          // Invalid stored user, clear it
          localStorage.removeItem('hanbuy_user');
        }
      }
    }

    // If no cached user, try to get from API
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hanbuy_user', JSON.stringify(currentUser));
      }
    } catch (err) {
      // Not authenticated or API error
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (logout from other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔐 useAuth: Attempting login...");
      const response = await authService.login(email, password);
      console.log("✅ useAuth: Login successful, setting user:", response.user);
      
      setUser(response.user);
      
      // Store user in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('hanbuy_user', JSON.stringify(response.user));
      }
      
      setLoading(false);
      return response.user;
    } catch (err) {
      console.error("❌ useAuth: Login failed:", err);
      const errorMessage = handleApiError(err).message;
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isCustomer: user?.role === "customer",
    loading,
    error,
    login,
    logout,
    refetch: checkAuth,
  };
}

