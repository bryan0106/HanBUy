import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

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

export interface GetUsersParams {
  role?: 'customer' | 'admin' | 'solobox_client';
  approval_status?: 'pending' | 'approved' | 'rejected';
  page?: number;
  limit?: number;
}

export interface GetUsersResponse {
  success: boolean;
  data: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
    country: string;
  };
  client_level?: 'solobox' | 'box_sharing' | 'kr_to_kr' | 'international';
  approval_status?: 'pending' | 'approved' | 'rejected';
}

export interface GetUserResponse {
  success: boolean;
  data: User;
}

export interface UpdateUserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export const userService = {
  /**
   * Get users with optional filters
   */
  async getUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
    try {
      const response = await apiClient.get<GetUsersResponse>('/users', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get specific user by ID
   */
  async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<GetUserResponse>(`/users/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update user information
   */
  async updateUser(id: string, updates: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiClient.put<UpdateUserResponse>(`/users/${id}`, updates);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
