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
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('hanbuy_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        
        // Log token in development (first 10 chars only for security)
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔑 Adding token to ${config.method?.toUpperCase()} ${config.url}:`, token.substring(0, 10) + '...');
        }
      } else {
        // Log when no token is available
        if (process.env.NODE_ENV === 'development' && config.url?.includes('/auth/me')) {
          console.warn('⚠️ No token found for /auth/me request');
        }
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
        const requestUrl = error.config?.url || '';
        
        // Don't redirect if we're already on login/register pages
        const isAuthPage = currentPath === '/auth/login' || currentPath === '/auth/register';
        
        // Log 401 error details in development
        if (process.env.NODE_ENV === 'development') {
          const token = localStorage.getItem('hanbuy_token');
          console.error('❌ 401 Unauthorized:', {
            url: requestUrl,
            path: currentPath,
            hasToken: !!token,
            tokenPreview: token ? token.substring(0, 10) + '...' : 'none'
          });
        }
        
        // For /auth/me failures, don't redirect if we just logged in (within last 5 seconds)
        // This prevents redirect loops after successful login
        const isMeEndpoint = requestUrl.includes('/auth/me');
        const lastLoginTime = sessionStorage.getItem('last_login_time');
        const timeSinceLogin = lastLoginTime ? Date.now() - parseInt(lastLoginTime) : Infinity;
        const justLoggedIn = timeSinceLogin < 5000; // 5 seconds
        
        if (isMeEndpoint && justLoggedIn) {
          console.warn('⚠️ /auth/me failed shortly after login, skipping redirect');
          return Promise.reject(error);
        }
        
        // Clear tokens
        localStorage.removeItem('hanbuy_token');
        localStorage.removeItem('hanbuy_user');
        
        // Only redirect if not already on auth pages and not just logged in
        if (!isAuthPage && !(isMeEndpoint && justLoggedIn)) {
          // Use a small delay to prevent redirect loops
          setTimeout(() => {
            if (window.location.pathname !== '/auth/login') {
              window.location.href = '/auth/login';
            }
          }, 100);
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
