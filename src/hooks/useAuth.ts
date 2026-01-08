"use client";

import { useState, useEffect, useCallback } from "react";
import { authService, type User } from "@/services/authService";
import { handleApiError } from "@/utils/errorHandler";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const checkAuth = useCallback(async (skipVerification = false) => {
    // Check if we just logged in (within last 5 seconds)
    let shouldSkip = skipVerification || justLoggedIn;
    
    if (typeof window !== 'undefined' && !shouldSkip) {
      const lastLoginTime = sessionStorage.getItem('last_login_time');
      if (lastLoginTime) {
        const timeSinceLogin = Date.now() - parseInt(lastLoginTime);
        shouldSkip = timeSinceLogin < 5000; // 5 seconds
        if (shouldSkip) {
          console.log('⏭️ Skipping /auth/me verification (just logged in)');
        }
      }
    }
    
    // First check localStorage for cached user
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('hanbuy_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setLoading(false);
          
          // Optionally verify with API (skip if we just logged in or explicitly skipped)
          if (!shouldSkip) {
            try {
              console.log('🔍 Verifying user with /auth/me');
              const currentUser = await authService.getCurrentUser();
              setUser(currentUser);
              // Update localStorage with fresh data
              localStorage.setItem('hanbuy_user', JSON.stringify(currentUser));
            } catch (err) {
              // If API call fails, keep cached user but log error
              // Don't redirect here - let the API client handle it only if needed
              const apiError = handleApiError(err);
              console.warn('⚠️ Failed to verify user with API:', {
                status: apiError.status,
                message: apiError.message,
                path: window.location.pathname
              });
              
              // Only clear if it's a 401 and we're not on login page
              if (apiError.status === 401 && window.location.pathname !== '/auth/login') {
                // Check if this is happening right after login
                const lastLoginTime = sessionStorage.getItem('last_login_time');
                const timeSinceLogin = lastLoginTime ? Date.now() - parseInt(lastLoginTime) : Infinity;
                const justLoggedIn = timeSinceLogin < 5000;
                
                if (!justLoggedIn) {
                  // Token is invalid, clear it
                  console.log('🗑️ Clearing invalid token');
                  localStorage.removeItem('hanbuy_token');
                  localStorage.removeItem('hanbuy_user');
                  setUser(null);
                } else {
                  console.log('⏭️ Ignoring 401 error (just logged in)');
                }
              }
            }
          } else {
            console.log('✅ Using cached user (verification skipped)');
          }
          return;
        } catch {
          // Invalid stored user, clear it
          localStorage.removeItem('hanbuy_user');
        }
      }
    }

    // If no cached user, try to get from API (only if not skipping verification)
    if (!shouldSkip) {
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
    } else {
      setLoading(false);
    }
  }, [justLoggedIn]);

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
      
      // Set user state immediately - don't verify with /auth/me since we just logged in
      setUser(response.user);
      
      // Store user in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('hanbuy_user', JSON.stringify(response.user));
      }
      
      // Set flag to skip verification for a short time after login
      setJustLoggedIn(true);
      // Also store in sessionStorage for API client to check
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('last_login_time', Date.now().toString());
      }
      setTimeout(() => {
        setJustLoggedIn(false);
      }, 5000); // Skip verification for 5 seconds after login
      
      setLoading(false);
      return response.user;
    } catch (err) {
      const apiError = handleApiError(err);
      const errorMessage = apiError.message || 'Login failed. Please try again.';
      console.error("❌ useAuth: Login failed:", {
        message: errorMessage,
        status: apiError.status,
        code: apiError.code,
        originalError: err
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

