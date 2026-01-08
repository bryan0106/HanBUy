import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Get base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hanbuyapi.onrender.com/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to all requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('hanbuy_token');
      if (token && token.trim()) {
        config.headers.Authorization = `Bearer ${token.trim()}`;
      }
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
    // Log error details in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      if (!error.response) {
        console.error('🌐 Network Error:', {
          message: error.message,
          code: error.code,
          config: {
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            method: error.config?.method,
          }
        });
      }
    }

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

// Log API URL in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔗 Backend API URL:', API_BASE_URL);
}

export default apiClient;
