import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'customer' | 'admin' | 'solobox_client';
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'admin' | 'solobox_client';
  client_level?: 'solobox' | 'box_sharing' | 'kr_to_kr' | 'international';
  approval_status?: 'pending' | 'approved' | 'rejected';
  address?: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
    country: string;
  };
  created_at?: string;
  updated_at?: string;
}

// Raw response from backend (may have different formats)
export interface LoginResponseRaw {
  success?: boolean;
  user?: User;
  token: string;
  message?: string;
  // Backend may return user fields at root level
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  role?: 'customer' | 'admin' | 'solobox_client';
  client_level?: 'solobox' | 'box_sharing' | 'kr_to_kr' | 'international';
  approval_status?: 'pending' | 'approved' | 'rejected';
  address?: {
    street?: string;
    city?: string;
    province?: string;
    zipCode?: string;
    zipcode?: string;
    country?: string;
  };
  created_at?: string;
  updated_at?: string;
}

// Normalized response (always has user)
export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user: User;
  message?: string;
}

export interface MeResponse {
  success: boolean;
  user: User;
}

export const authService = {
  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<any>('/auth/login', {
        email,
        password,
      });

      const data: LoginResponseRaw = response.data;

      // Handle different response formats
      // Format 1: { success: true, user: {...}, token: "..." }
      // Format 2: { id: "...", email: "...", name: "...", token: "..." } (user fields at root)
      
      let user: User;
      let token: string;

      if (data.user && data.token) {
        // Standard format with user object
        user = data.user;
        token = data.token;
      } else if (data.id && data.email && data.token) {
        // Backend returns user fields at root level
        user = {
          id: data.id,
          email: data.email,
          name: data.name || '',
          phone: data.phone,
          role: data.role || 'customer',
          client_level: data.client_level,
          approval_status: data.approval_status,
          address: data.address ? {
            street: data.address.street || '',
            city: data.address.city || '',
            province: data.address.province || '',
            zipCode: data.address.zipCode || data.address.zipcode || '',
            country: data.address.country || '',
          } : undefined,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        token = data.token;
      } else {
        throw new Error('Invalid response format from login API');
      }

      // Create normalized response (always has user)
      const normalizedResponse: LoginResponse = {
        success: true,
        user,
        token,
        message: data.message,
      };

      // Store token if provided
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('hanbuy_token', token);
        // Store login timestamp to prevent immediate /auth/me redirects
        sessionStorage.setItem('last_login_time', Date.now().toString());
        console.log('✅ Token stored successfully');
      } else {
        console.warn('⚠️ No token in login response');
      }

      return normalizedResponse;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
      
      // Clear token and user data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hanbuy_token');
        localStorage.removeItem('hanbuy_user');
      }
    } catch (error) {
      // Even if API call fails, clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hanbuy_token');
        localStorage.removeItem('hanbuy_user');
      }
      throw handleApiError(error);
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<MeResponse>('/auth/me');
      return response.data.user;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get current user (alias for getCurrentUser)
   */
  async getMe(): Promise<User> {
    return this.getCurrentUser();
  },
};
