import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';
import { shouldUseMockData } from '@/utils/env';
import { mockCartService } from '@/lib/mockOrdersData';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product_name?: string;
  product_type?: 'onhand' | 'preorder' | 'kr_website';
  quantity: number;
  price?: number;
  image_url?: string;
  box_type_preference?: 'solo' | 'shared';
  created_at?: string;
  updated_at?: string;
  product?: {
    id: string;
    name: string;
    price: number;
    currency: string;
    images: string[];
    stock: number;
  };
}

export interface GetCartParams {
  user_id: string;
}

export interface GetCartResponse {
  success: boolean;
  data: CartItem[];
}

export interface AddToCartRequest {
  user_id: string;
  product_id: string;
  quantity: number;
  box_type_preference?: 'solo' | 'shared';
  shared_box_id?: string; // Required when box_type_preference is 'shared'
  box_size?: 'small' | 'medium' | 'large'; // Required when box_type_preference is 'solo'
}

export interface AddToCartResponse {
  success: boolean;
  data: CartItem;
  message?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface UpdateCartItemResponse {
  success: boolean;
  data: CartItem;
  message?: string;
}

export interface DeleteCartItemResponse {
  success: boolean;
  message?: string;
}

export const cartService = {
  /**
   * Get cart items for a user
   */
  async getCartItems(userId: string): Promise<CartItem[]> {
    // Use mock data for testing
    if (shouldUseMockData()) {
      return mockCartService.getCartItems(userId);
    }

    try {
      const response = await apiClient.get<GetCartResponse>('/cart', {
        params: { user_id: userId },
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Add item to cart
   */
  async addToCart(data: AddToCartRequest): Promise<CartItem> {
    // Use mock data for testing
    if (shouldUseMockData()) {
      return mockCartService.addToCart(data);
    }

    try {
      const response = await apiClient.post<AddToCartResponse>('/cart', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update cart item quantity
   */
  async updateCartItem(cartItemId: string, quantity: number): Promise<CartItem> {
    // Use mock data for testing
    if (shouldUseMockData()) {
      return mockCartService.updateCartItem(cartItemId, quantity);
    }

    try {
      const response = await apiClient.put<UpdateCartItemResponse>(`/cart/${cartItemId}`, {
        quantity,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Remove item from cart
   */
  async removeCartItem(cartItemId: string): Promise<void> {
    // Use mock data for testing
    if (shouldUseMockData()) {
      return mockCartService.removeCartItem(cartItemId);
    }

    try {
      await apiClient.delete<DeleteCartItemResponse>(`/cart/${cartItemId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get cart (alias for getCartItems)
   */
  async getCart(userId: string): Promise<CartItem[]> {
    return this.getCartItems(userId);
  },

  /**
   * Remove from cart (alias for removeCartItem)
   */
  async removeFromCart(cartItemId: string): Promise<void> {
    return this.removeCartItem(cartItemId);
  },
};
