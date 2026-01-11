import apiClient from '@/lib/apiClient';
import { shouldUseMockData } from '@/utils/env';
import { mockLikedService } from '@/lib/mockLikedData';

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

export const likedService = {
  /**
   * Get user's liked items (wishlist)
   */
  async getLikedItems(params?: GetLikedItemsParams): Promise<GetLikedItemsResponse> {
    // Use mock data for testing on localhost
    if (shouldUseMockData()) {
      console.log('❤️ Using mock data for liked items (localhost)');
      return mockLikedService.getLikedItems(params);
    }

    try {
      console.log('🔗 Fetching liked items from API:', '/liked', params);
      const response = await apiClient.get<GetLikedItemsResponse>('/liked', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching liked items:', error);
      // Re-throw the original error so components can handle it properly
      throw error;
    }
  },

  /**
   * Add item to liked list
   */
  async addToLiked(productId: string): Promise<LikedItem> {
    // Use mock data for testing on localhost
    if (shouldUseMockData()) {
      console.log('❤️ Using mock data to add to liked (localhost)');
      return mockLikedService.addToLiked(productId);
    }

    try {
      console.log('🔗 Adding to liked via API:', '/liked', { product_id: productId });
      const response = await apiClient.post<AddToLikedResponse>('/liked', {
        product_id: productId,
      });
      return response.data.data;
    } catch (error) {
      console.error('❌ Error adding to liked:', error);
      // Re-throw the original error so components can handle it properly
      throw error;
    }
  },

  /**
   * Remove item from liked list
   */
  async removeFromLiked(productId: string): Promise<void> {
    // Use mock data for testing on localhost
    if (shouldUseMockData()) {
      console.log('❤️ Using mock data to remove from liked (localhost)');
      return mockLikedService.removeFromLiked(productId);
    }

    try {
      console.log('🔗 Removing from liked via API:', `/liked/${productId}`);
      await apiClient.delete<RemoveFromLikedResponse>(`/liked/${productId}`);
    } catch (error) {
      console.error('❌ Error removing from liked:', error);
      // Re-throw the original error so components can handle it properly
      throw error;
    }
  },
};
