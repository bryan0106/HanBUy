'use client';

import { useState, useEffect, useCallback } from 'react';
import { orderService, type Order, type GetOrdersParams } from '@/services/orderService';
import { handleApiError } from '@/utils/errorHandler';

export interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  refetch: () => Promise<void>;
  getOrder: (id: string) => Promise<Order | null>;
  createOrder: (data: {
    user_id: string;
    order_number: string;
    subtotal: number;
    isf: number;
    lsf: number;
    shipping_fee: number;
    solo_shipping_fee?: number;
    shared_shipping_fee?: number;
    total: number;
    currency: 'PHP' | 'KRW';
    status: string;
    payment_status: string;
    payment_type: 'full' | 'downpayment';
    payment_method?: {
      type: 'qr_code' | 'bank_transfer' | 'online';
      bank: 'BPI' | 'BDO' | 'GCASH' | 'GOTYME' | 'MAYA';
    };
    downpayment_amount?: number | null;
    balance?: number | null;
    qr_code?: string;
    box_type_preference: 'solo' | 'shared';
    shipping_address: {
      street: string;
      city: string;
      province: string;
      zipCode: string;
      country: string;
    };
    order_items: Array<{
      product_id: string;
      product_name: string;
      product_type: 'onhand' | 'preorder' | 'kr_website';
      quantity: number;
      unit_price: number;
      total: number;
      image_url?: string;
      preorder_release_date?: string | null;
    }>;
  }) => Promise<Order | null>;
}

export function useOrders(params?: GetOrdersParams): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseOrdersReturn['pagination']>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrders(params);
      setOrders(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      const errorMessage = handleApiError(err).message;
      setError(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getOrder = useCallback(async (id: string): Promise<Order | null> => {
    try {
      const order = await orderService.getOrderById(id);
      return order;
    } catch (err) {
      const errorMessage = handleApiError(err).message;
      setError(errorMessage);
      return null;
    }
  }, []);

  const createOrder = useCallback(
    async (data: Parameters<UseOrdersReturn['createOrder']>[0]): Promise<Order | null> => {
      try {
        const order = await orderService.createOrder(data);
        await fetchOrders(); // Refresh orders after creating
        return order;
      } catch (err) {
        const errorMessage = handleApiError(err).message;
        setError(errorMessage);
        return null;
      }
    },
    [fetchOrders]
  );

  return {
    orders,
    loading,
    error,
    pagination,
    refetch: fetchOrders,
    getOrder,
    createOrder,
  };
}
