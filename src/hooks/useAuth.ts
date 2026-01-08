"use client";

import { useState, useEffect, useCallback } from "react";
import { authService, type User } from "@/services/authService";
import { handleApiError } from "@/utils/errorHandler";
import "@/utils/tokenDebug"; // Initialize token debug utilities

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const checkAuth = useCallback(async () => {
    // Simple: Just check localStorage for user and token
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('hanbuy_user');
      const storedToken = localStorage.getItem('hanbuy_token');
      
      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setLoading(false);
          return; // User is logged in, no need to verify
        } catch {
          // Invalid stored user, clear it
          localStorage.removeItem('hanbuy_user');
          localStorage.removeItem('hanbuy_token');
        }
      }
    }
    
    // No user or token found
    setUser(null);
    setLoading(false);
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
      console.log("✅ useAuth: Login successful, response:", response);
      
      if (!response || !response.user) {
        throw new Error("Login response missing user data");
      }
      
      if (!response.token) {
        throw new Error("Login response missing token");
      }
      
      console.log("✅ useAuth: Setting user state:", response.user);
      
      // Simple: Store token and user, set state, done
      if (typeof window !== 'undefined') {
        localStorage.setItem('hanbuy_token', response.token.trim());
        localStorage.setItem('hanbuy_user', JSON.stringify(response.user));
      }
      
      setUser(response.user);
      setLoading(false);
      
      return response.user;
    } catch (err) {
      const apiError = handleApiError(err);
      const errorMessage = apiError.message || 'Login failed. Please try again.';
      console.error("❌ useAuth: Login failed:", {
        message: errorMessage,
        status: apiError.status,
        code: apiError.code,
        originalError: err,
        errorType: err instanceof Error ? err.constructor.name : typeof err
      });
      setError(errorMessage);
      setLoading(false);
      // Throw a proper Error instance with the message
      const error = new Error(errorMessage);
      (error as any).status = apiError.status;
      (error as any).code = apiError.code;
      throw error;
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

