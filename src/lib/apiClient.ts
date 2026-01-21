import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { getApiBaseUrl, shouldUseMockData } from '@/utils/env';

// Get base URL from environment variable
// Production default: https://hanbuy-api.onrender.com/api
// Localhost: Use localhost:3001/api or set NEXT_PUBLIC_API_URL
const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  withCredentials: true, // Enable CORS with cookies/credentials
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log API configuration (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('📦 Using Mock Data:', shouldUseMockData());
}

// Request interceptor - Add JWT token to all requests and prevent caching
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('hanbuy_token');
      if (token && token.trim()) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token.trim()}`;
      }
    }
    
    // Prevent caching for GET requests by adding cache-busting timestamp
    // Note: We don't set Cache-Control headers here as they trigger CORS preflight
    // The backend should set appropriate cache-control headers in the response
    if (config.method === 'get') {
      // Add cache-busting timestamp to query params to ensure fresh data
      const timestamp = Date.now();
      config.params = {
        ...config.params,
        _t: timestamp, // Cache-busting parameter
      };
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - Clear token and redirect to login
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isLoginRequest = requestUrl.includes('/auth/login');
      
      // Log 401 errors for login requests to help debug
      if (isLoginRequest && typeof window !== 'undefined') {
        const errorData = error.response?.data as any;
        console.error('Login failed (401):', {
          url: `${error.config?.baseURL}${requestUrl}`,
          error: errorData?.error || errorData?.message || 'Invalid credentials',
          // Don't log sensitive data
        });
      }
      
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === '/auth/login' || currentPath === '/auth/register' || currentPath === '/admin/login';
        const isAdminPage = currentPath.startsWith('/admin');
        
        // Clear tokens
        localStorage.removeItem('hanbuy_token');
        localStorage.removeItem('hanbuy_user');
        
        // Redirect to appropriate login page if not already on auth pages
        if (!isAuthPage) {
          if (isAdminPage) {
            window.location.href = '/admin/login';
          } else {
            window.location.href = '/auth/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);


export default apiClient;
