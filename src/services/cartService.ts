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
    price: number | string; // Can be number or string from API
    currency: string;
    images: string[];
    stock: number;
    price_conversion_rate?: number;
    php_price?: number;
    product_type?: 'onhand' | 'preorder' | 'kr_website';
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
    try {
      console.log('🔗 Fetching cart from API:', `/cart?user_id=${userId}`);
      const response = await apiClient.get<GetCartResponse>('/cart', {
        params: { user_id: userId },
      });
      console.log('✅ Cart API response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Add item to cart
   */
  async addToCart(data: AddToCartRequest): Promise<CartItem> {
    try {
      console.log('🔗 Adding to cart via API:', '/cart', data);
      const response = await apiClient.post<AddToCartResponse>('/cart', data);
      console.log('✅ Add to cart API response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Update cart item quantity
   */
  async updateCartItem(cartItemId: string, quantity: number): Promise<CartItem> {
    try {
      console.log('🔗 Updating cart item via API:', `/cart/${cartItemId}`, { quantity });
      const response = await apiClient.put<UpdateCartItemResponse>(`/cart/${cartItemId}`, {
        quantity,
      });
      console.log('✅ Update cart item API response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error updating cart item:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Remove item from cart
   */
  async removeCartItem(cartItemId: string): Promise<void> {
    try {
      console.log('🔗 Removing cart item via API:', `/cart/${cartItemId}`);
      await apiClient.delete<DeleteCartItemResponse>(`/cart/${cartItemId}`);
      console.log('✅ Cart item removed successfully');
    } catch (error) {
      console.error('❌ Error removing cart item:', error);
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

  /**
   * Clear all items from cart
   */
  async clearCart(): Promise<void> {
    try {
      console.log('🔗 Clearing cart via API:', '/cart');
      await apiClient.delete<DeleteCartItemResponse>('/cart');
      console.log('✅ Cart cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      throw handleApiError(error);
    }
  },
};
