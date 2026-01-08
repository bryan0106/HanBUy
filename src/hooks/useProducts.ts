'use client';

import { useState, useEffect, useCallback } from 'react';
import { productService, type Product, type GetProductsParams } from '@/services/productService';
import { handleApiError } from '@/utils/errorHandler';

export interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  refetch: () => Promise<void>;
  getProduct: (id: string) => Promise<Product | null>;
  getOnhandProducts: () => Promise<void>;
  getPreorderProducts: () => Promise<void>;
}

export function useProducts(params?: GetProductsParams): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseProductsReturn['pagination']>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts(params);
      setProducts(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      const errorMessage = handleApiError(err).message;
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getProduct = useCallback(async (id: string): Promise<Product | null> => {
    try {
      const product = await productService.getProductById(id);
      return product;
    } catch (err) {
      const errorMessage = handleApiError(err).message;
      setError(errorMessage);
      return null;
    }
  }, []);

  const getOnhandProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getOnhandProducts(params);
      setProducts(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      const errorMessage = handleApiError(err).message;
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const getPreorderProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getPreorderProducts(params);
      setProducts(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      const errorMessage = handleApiError(err).message;
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts,
    getProduct,
    getOnhandProducts,
    getPreorderProducts,
  };
}
