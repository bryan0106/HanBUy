import apiClient from '@/lib/apiClient';

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
    try {
      const response = await apiClient.get<GetLikedItemsResponse>('/liked', { params });
      return response.data;
    } catch (error) {
      // Re-throw the original error so components can handle it properly
      throw error;
    }
  },

  /**
   * Add item to liked list
   */
  async addToLiked(productId: string): Promise<LikedItem> {
    try {
      const response = await apiClient.post<AddToLikedResponse>('/liked', {
        product_id: productId,
      });
      return response.data.data;
    } catch (error) {
      // Re-throw the original error so components can handle it properly
      throw error;
    }
  },

  /**
   * Remove item from liked list
   */
  async removeFromLiked(productId: string): Promise<void> {
    try {
      await apiClient.delete<RemoveFromLikedResponse>(`/liked/${productId}`);
    } catch (error) {
      // Re-throw the original error so components can handle it properly
      throw error;
    }
  },
};
