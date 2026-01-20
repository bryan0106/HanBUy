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
  installment_approved?: boolean; // Whether customer is approved for installment payment
  address?: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
    country: string;
    region?: string;
  };
  created_at?: string;
  updated_at?: string;
}

  // Raw response from backend (may have different formats)
export interface LoginResponseRaw {
  success?: boolean;
  user?: User;
  data?: {
    user?: User;
    token?: string;
  };
  token?: string;
  message?: string;
  // Backend may return user fields at root level
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  role?: 'customer' | 'admin' | 'solobox_client';
  client_level?: 'solobox' | 'box_sharing' | 'kr_to_kr' | 'international';
  approval_status?: 'pending' | 'approved' | 'rejected';
  installment_approved?: boolean; // Whether customer is approved for installment payment
  address?: {
    street?: string;
    city?: string;
    province?: string;
    zipCode?: string;
    zipcode?: string;
    country?: string;
    region?: string;
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
      // Normalize email (lowercase, trim) - backend should do this too but ensure frontend does it
      const normalizedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();
      
      const response = await apiClient.post<any>('/auth/login', {
        email: normalizedEmail,
        password: trimmedPassword,
      });

      const data: LoginResponseRaw = response.data;

      // Simplified: Handle { success: true, data: { user: {...}, token: "..." } }
      let user: User;
      let token: string;

      // Primary format: { success: true, data: { user: {...}, token: "..." } }
      if (data.data?.user && data.data?.token) {
        user = data.data.user;
        token = data.data.token;
      }
      // Fallback: token at root { success: true, data: { user: {...} }, token: "..." }
      else if (data.data?.user && data.token) {
        user = data.data.user;
        token = data.token;
      }
      // Fallback: { success: true, user: {...}, token: "..." }
      else if (data.user && data.token) {
        user = data.user;
        token = data.token;
      }
      // Fallback: user fields at root
      else if (data.id && data.email && data.token) {
        user = {
          id: data.id,
          email: data.email,
          name: data.name || '',
          phone: data.phone,
          role: data.role || 'customer',
          client_level: data.client_level,
          approval_status: data.approval_status,
          installment_approved: data.installment_approved,
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
      }
      else {
        throw new Error('Invalid login response format');
      }

      // Simple check - if we have token and user, we're good
      if (!token || !user) {
        throw new Error('Login response missing token or user data');
      }

      // Create normalized response (always has user)
      const normalizedResponse: LoginResponse = {
        success: true,
        user,
        token,
        message: data.message,
      };

      // Store token and user immediately - simple and straightforward
      // Always reset localStorage if admin logs in
      if (typeof window !== 'undefined' && token && user) {
        // If admin, clear all localStorage first to reset any previous session
        if (user.role === 'admin') {
          localStorage.removeItem('hanbuy_token');
          localStorage.removeItem('hanbuy_user');
        }
        
        // Store new token and user
        localStorage.setItem('hanbuy_token', token.trim());
        localStorage.setItem('hanbuy_user', JSON.stringify(user));
      }


      return normalizedResponse;
    } catch (error) {
      const apiError = handleApiError(error);
      throw apiError;
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
