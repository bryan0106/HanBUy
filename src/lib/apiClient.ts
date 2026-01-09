import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

// Get base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hanbuy-api.onrender.com/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    // Silently handle errors

    // Handle 401 Unauthorized - Clear token and redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === '/auth/login' || currentPath === '/auth/register';
        
        // Clear tokens
        localStorage.removeItem('hanbuy_token');
        localStorage.removeItem('hanbuy_user');
        
        // Redirect to login if not already on auth pages
        if (!isAuthPage) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);


export default apiClient;
