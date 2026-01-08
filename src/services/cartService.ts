import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

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
    try {
      await apiClient.delete<DeleteCartItemResponse>(`/cart/${cartItemId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
