import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

export interface LikedItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: {
    id: string;
    name: string;
    price: number;
    currency: string;
    images: string[];
    stock: number;
  };
  created_at: string;
}

export interface GetLikedItemsParams {
  page?: number;
  limit?: number;
}

export interface GetLikedItemsResponse {
  success: boolean;
  data: LikedItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AddToLikedRequest {
  product_id: string;
}

export interface AddToLikedResponse {
  success: boolean;
  data: LikedItem;
  message?: string;
}

export interface RemoveFromLikedResponse {
  success: boolean;
  message?: string;
}

export interface CheckIfLikedResponse {
  success: boolean;
  data: {
    is_liked: boolean;
  };
  message?: string;
}

export const likedService = {
  /**
   * Get user's liked items (wishlist)
   */
  async getLikedItems(params?: GetLikedItemsParams): Promise<GetLikedItemsResponse> {
    try {
      console.log('🔗 Fetching liked items from API:', '/liked', params);
      const response = await apiClient.get<GetLikedItemsResponse>('/liked', { params });
      console.log('✅ Liked items API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching liked items:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Check if a product is liked by the current user
   */
  async checkIfLiked(productId: string): Promise<boolean> {
    try {
      console.log('🔗 Checking if liked via API:', `/liked/check/${productId}`);
      const response = await apiClient.get<CheckIfLikedResponse>(`/liked/check/${productId}`);
      console.log('✅ Check if liked API response:', response.data);
      return response.data.data.is_liked;
    } catch (error) {
      console.error('❌ Error checking if liked:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Add item to liked list
   */
  async addToLiked(productId: string): Promise<LikedItem> {
    try {
      console.log('🔗 Adding to liked via API:', '/liked', { product_id: productId });
      const response = await apiClient.post<AddToLikedResponse>('/liked', {
        product_id: productId,
      });
      console.log('✅ Add to liked API response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error adding to liked:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Remove item from liked list
   */
  async removeFromLiked(productId: string): Promise<void> {
    try {
      console.log('🔗 Removing from liked via API:', `/liked/${productId}`);
      await apiClient.delete<RemoveFromLikedResponse>(`/liked/${productId}`);
      console.log('✅ Removed from liked successfully');
    } catch (error) {
      console.error('❌ Error removing from liked:', error);
      throw handleApiError(error);
    }
  },
};
