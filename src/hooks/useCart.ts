'use client';

import { useState, useEffect, useCallback } from 'react';
import { cartService, type CartItem } from '@/services/cartService';
import { handleApiError } from '@/utils/errorHandler';

export interface UseCartReturn {
  cartItems: CartItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addToCart: (data: {
    user_id: string;
    product_id: string;
    quantity: number;
    box_type_preference?: 'solo' | 'shared';
  }) => Promise<CartItem | null>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeCartItem: (cartItemId: string) => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
}

export function useCart(userId: string | null): UseCartReturn {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!userId) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const items = await cartService.getCartItems(userId);
      setCartItems(items);
    } catch (err) {
      const errorMessage = handleApiError(err).message;
      setError(errorMessage);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (data: {
      user_id: string;
      product_id: string;
      quantity: number;
      box_type_preference?: 'solo' | 'shared';
    }): Promise<CartItem | null> => {
      try {
        const item = await cartService.addToCart(data);
        await fetchCart(); // Refresh cart after adding
        return item;
      } catch (err) {
        const errorMessage = handleApiError(err).message;
        setError(errorMessage);
        return null;
      }
    },
    [fetchCart]
  );

  const updateCartItem = useCallback(
    async (cartItemId: string, quantity: number): Promise<void> => {
      try {
        await cartService.updateCartItem(cartItemId, quantity);
        await fetchCart(); // Refresh cart after updating
      } catch (err) {
        const errorMessage = handleApiError(err).message;
        setError(errorMessage);
        throw err;
      }
    },
    [fetchCart]
  );

  const removeCartItem = useCallback(
    async (cartItemId: string): Promise<void> => {
      try {
        await cartService.removeCartItem(cartItemId);
        await fetchCart(); // Refresh cart after removing
      } catch (err) {
        const errorMessage = handleApiError(err).message;
        setError(errorMessage);
        throw err;
      }
    },
    [fetchCart]
  );

  const getTotal = useCallback((): number => {
    return cartItems.reduce((total, item) => {
      const price = item.price || item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const getItemCount = useCallback((): number => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  return {
    cartItems,
    loading,
    error,
    refetch: fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    getTotal,
    getItemCount,
  };
}
